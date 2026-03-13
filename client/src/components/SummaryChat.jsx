import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InteractiveMessage = ({ text, sender }) => {
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Split text into words but keep punctuation
    const words = text.split(/(\s+)/);

    const speakWord = (word) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        window.speechSynthesis.speak(utterance);
    };

    const speakFull = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setHighlightIndex(-1);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        // Voice selection logic (Indian/Female)
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'))
            || voices.find(v => v.name.includes('Female'))
            || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        let wordBoundaryIndex = 0;

        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                // Approximate word mapping based on char index
                const charIndex = event.charIndex;
                let currentLen = 0;
                for (let i = 0; i < words.length; i++) {
                    currentLen += words[i].length;
                    if (currentLen > charIndex) {
                        setHighlightIndex(i);
                        break;
                    }
                }
            }
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setHighlightIndex(-1);
        };

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    // Auto-speak ONLY for new bot messages
    useEffect(() => {
        if (sender === 'agent') {
            speakFull();
        }
        return () => window.speechSynthesis.cancel();
    }, []);

    return (
        <div className="relative">
            <button
                onClick={speakFull}
                className={`absolute -right-8 -top-2 p-2 rounded-full transition-colors ${isSpeaking ? 'text-amber-500 animate-pulse' : 'text-purple-300 hover:text-purple-600'}`}
            >
                {isSpeaking ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
            </button>

            <p className="leading-relaxed">
                {words.map((word, i) => (
                    <span
                        key={i}
                        onClick={(e) => { e.stopPropagation(); speakWord(word); }}
                        className={`
                            cursor-pointer transition-all duration-200 rounded px-0.5
                            ${i === highlightIndex ? 'bg-yellow-300 text-purple-900 font-bold scale-110 shadow-sm' : 'hover:bg-purple-100 hover:text-purple-700'}
                        `}
                    >
                        {word}
                    </span>
                ))}
            </p>
        </div>
    );
};

const SummaryChat = ({ onFinish, explanationStyle, comfortMode }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [topicMemory, setTopicMemory] = useState({});
    const [interactionCount, setInteractionCount] = useState(0);
    const [suggestion, setSuggestion] = useState(null);
    const chatContainerRef = useRef(null);

    const user = localStorage.getItem('dyslexia-agent-name') || 'student';
    const age = localStorage.getItem('dyslexia-agent-age') || 12;

    const topics = {
        phonics: ['phonics', 'sound', 'letters', 'pronounce'],
        spelling: ['spell', 'spelling', 'write', 'writing', 'alphabet'],
        reading: ['read', 'reading', 'book', 'story']
    };

    useEffect(() => {
        const init = async () => {
            try {
                const res = await fetch(`http://localhost:3005/api/history?user=${user}`);
                const history = await res.json();

                // Clear History Fix: Filter history based on local clear timestamp
                const clearTimestamp = parseInt(localStorage.getItem(`nemo-clear-ts-${user}`) || '0');

                if (history && history.length > 0) {
                    const filtered = history.filter(h => h.id > clearTimestamp);
                    
                    if (filtered.length > 0) {
                        const formatted = [];
                        filtered.forEach(h => {
                            formatted.push({ id: h.id + '_q', sender: 'user', text: h.message });
                            formatted.push({ id: h.id + '_a', sender: 'agent', text: h.response });
                        });
                        setMessages(formatted);
                    } else {
                        setMessages([{
                            id: 'init',
                            sender: 'agent',
                            text: `Hi ${user}! I'm NEMO. I'm here to help you read and learn! What's on your mind today?`
                        }]);
                    }
                } else {
                    setMessages([{
                        id: 'init',
                        sender: 'agent',
                        text: `Hi ${user}! I'm NEMO. I'm here to help you read and learn! What's on your mind today?`
                    }]);
                }
            } catch (e) {
                setMessages([{ id: 'err', sender: 'agent', text: "Oh no! I lost my connection to the ocean." }]);
            }
        };
        init();
    }, [user]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, loading]);

    const handleClearHistory = () => {
        // Clear locally stored messages and set a new baseline timestamp
        localStorage.setItem(`nemo-clear-ts-${user}`, Date.now().toString());
        setMessages([{
            id: 'init',
            sender: 'agent',
            text: `Hi ${user}! I'm NEMO. I'm here to help you read and learn! What's on your mind today?`
        }]);
        setSuggestion(null);
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setInteractionCount(prev => prev + 1);

        // Topic Tracking
        Object.keys(topics).forEach(topic => {
            if (topics[topic].some(keyword => currentInput.toLowerCase().includes(keyword))) {
                setTopicMemory(prev => {
                    const newCount = (prev[topic] || 0) + 1;
                    if (newCount >= 3) {
                        setSuggestion(`You seem interested in ${topic}. Would you like a short practice activity?`);
                    }
                    return { ...prev, [topic]: newCount };
                });
            }
        });

        // Greeting Detection & Thank You Detection (Local)
        const greetingRegex = /\b(hello|hi|hey)\b/i;
        const thanksRegex = /\b(thank you|thanks)\b/i;

        if (greetingRegex.test(currentInput)) {
            const agentMsg = { id: Date.now() + 1, sender: 'agent', text: "Hello! I'm happy to see you. How can I help you learn today?" };
            setTimeout(() => setMessages(prev => [...prev, agentMsg]), 500);
            return;
        }

        if (thanksRegex.test(currentInput)) {
            const agentMsg = { id: Date.now() + 1, sender: 'agent', text: "You're welcome! See you next time for more lessons." };
            setTimeout(() => setMessages(prev => [...prev, agentMsg]), 500);
            return;
        }

        // Encouragement Layer
        if (interactionCount > 0 && interactionCount % 4 === 0) {
            const encouragements = [
                "Great job practicing today! ✨",
                "Learning step by step helps your brain grow stronger. 🧠",
                "You're doing amazing! Keep going. 🌈"
            ];
            const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now() + 5, sender: 'agent', text: msg }]);
            }, 2000);
        }

        // Prompt Personalization
        let modifiedPrompt = currentInput;

        // Confidence Support
        const frustrationRegex = /\b(bad at|can't understand|hard|difficult|struggling)\b/i;
        if (frustrationRegex.test(currentInput)) {
            modifiedPrompt = `Respond with encouragement and explain the concept gently for a student who feels frustrated: ${modifiedPrompt}`;
        } else {
            // explanation style & comfort mode
            let styleContext = "";
            if (explanationStyle === 'simple') styleContext = "Give a very simple explanation. ";
            if (explanationStyle === 'detailed') styleContext = "Provide a detailed explanation with examples. ";

            let sizeContext = "";
            if (comfortMode === 'focus') sizeContext = "Answer in short simple sentences. Limit to 10-15 words. ";
            if (comfortMode === 'learning') sizeContext = "Provide a normal size answer. ";
            if (comfortMode === 'deep') sizeContext = "Provide an in-depth explanation. ";

            modifiedPrompt = `${styleContext}${sizeContext}${modifiedPrompt}`;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:3005/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: modifiedPrompt, age, user })
            });

            const data = await response.json();
            const agentMsg = { id: Date.now() + 1, sender: 'agent', text: data.message };
            setMessages(prev => [...prev, agentMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 2, sender: 'agent', text: "Sorry, I'm having a little trouble thinking. Let's try again in a bit!" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fadeIn max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-8 bg-white/70 p-6 rounded-[2rem] border-2 border-white shadow-lg backdrop-blur-md">
                <div className="p-3 bg-purple-600 rounded-xl shadow-md text-white">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-purple-900">Magical Chat</h2>
                    <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mt-1">Click any word to hear it!</p>
                </div>
            </div>

            <div className="glass-card p-6 h-[500px] flex flex-col mb-6 bg-white/80 border-2 border-white relative shadow-xl">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {messages.length === 0 && (
                        <div className="text-center text-purple-300 mt-20">
                            <Sparkles size={48} className="mx-auto mb-4 opacity-50 animate-pulse" />
                            <p className="text-lg font-medium">Hello, my child! 👋</p>
                            <p className="text-sm">I'm here to help you learn nicely. 🙏</p>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                                max-w-[80%] p-4 rounded-2xl text-lg font-medium shadow-sm relative text-left
                                ${msg.sender === 'user'
                                    ? 'bg-purple-100 text-purple-900 rounded-tr-none border-2 border-purple-200'
                                    : 'bg-white text-slate-700 rounded-tl-none border-2 border-slate-100'
                                }
                             `}>
                                <InteractiveMessage text={msg.text} sender={msg.sender} />
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border-2 border-slate-50 shadow-sm flex gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    )}
                    <div ref={chatContainerRef} />
                </div>

                <AnimatePresence>
                    {suggestion && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-yellow-100 border-2 border-yellow-400 p-4 rounded-2xl mb-4 flex items-center justify-between shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="text-yellow-600" />
                                <span className="text-sm font-bold text-yellow-900">{suggestion}</span>
                            </div>
                            <button onClick={() => setSuggestion(null)} className="text-yellow-600 font-black hover:scale-110 transition-transform">×</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-4 flex gap-4">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your question here..."
                        className="flex-1 p-4 rounded-xl bg-purple-50 border-2 border-purple-100 focus:border-purple-400 focus:bg-white outline-none transition-all placeholder-purple-300 text-purple-900 resize-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="bg-purple-600 text-white p-4 rounded-xl shadow-md hover:bg-purple-700 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                    >
                        <Send size={24} />
                    </button>
                </div>

                <div className="mt-4 flex justify-center text-slate-300 flex-col items-center gap-2">
                    <ArrowDownCircle size={20} className="animate-bounce" />
                    <span className="text-[9px] font-black uppercase tracking-[0.5em]">Scroll for history</span>
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-widest text-xs hover:text-purple-700 transition-colors bg-white/50 px-4 py-2 rounded-full"
                >
                    <RefreshCw size={14} /> Clear History
                </button>
            </div>
        </div>
    );
};

export default SummaryChat;
