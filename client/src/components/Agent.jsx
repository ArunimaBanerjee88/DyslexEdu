import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Sparkles, Star } from 'lucide-react';

const StarfishMascot = ({ isSpeaking }) => (
    <motion.div
        className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center p-4"
        animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
        }}
        transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_10px_30px_rgba(253,224,71,0.4)]">
            <defs>
                <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fde047" />
                    <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
            </defs>

            {/* Star Body */}
            <motion.path
                d="M 100 20 L 125 75 L 185 85 L 140 125 L 155 185 L 100 155 L 45 185 L 60 125 L 15 85 L 75 75 Z"
                fill="url(#starGrad)"
                stroke="#854d0e"
                strokeWidth="4"
                strokeLinejoin="round"
                animate={isSpeaking ? {
                    scale: [1, 1.05, 1],
                    d: [
                        "M 100 20 L 125 75 L 185 85 L 140 125 L 155 185 L 100 155 L 45 185 L 60 125 L 15 85 L 75 75 Z",
                        "M 100 15 L 130 80 L 190 90 L 145 130 L 160 190 L 100 160 L 40 190 L 55 130 L 10 90 L 70 80 Z",
                        "M 100 20 L 125 75 L 185 85 L 140 125 L 155 185 L 100 155 L 45 185 L 60 125 L 15 85 L 75 75 Z"
                    ]
                } : {}}
                transition={{ duration: 0.4, repeat: isSpeaking ? Infinity : 0 }}
            />

            {/* Rosy Cheeks */}
            <circle cx="75" cy="110" r="8" fill="#fb7185" opacity="0.6" />
            <circle cx="125" cy="110" r="8" fill="#fb7185" opacity="0.6" />

            {/* Eyes */}
            <circle cx="85" cy="95" r="10" fill="white" />
            <circle cx="115" cy="95" r="10" fill="white" />

            {/* Pupils with blinking */}
            <motion.circle
                cx="87" cy="97" r="5" fill="#1e293b"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
            />
            <motion.circle
                cx="117" cy="97" r="5" fill="#1e293b"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
            />

            {/* Mouth */}
            <motion.path
                d={isSpeaking ? "M 85 125 Q 100 145 115 125" : "M 85 125 Q 100 135 115 125"}
                fill="none"
                stroke="#854d0e"
                strokeWidth="5"
                strokeLinecap="round"
                animate={isSpeaking ? {
                    d: ["M 85 125 Q 100 145 115 125", "M 85 128 Q 100 132 115 128"]
                } : {}}
                transition={{ duration: 0.2, repeat: Infinity }}
            />
        </svg>

        {/* Small floating bubbles */}
        <AnimatePresence>
            {isSpeaking && [...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white/40 rounded-full border border-white/20"
                    initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                    animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        x: [0, (i - 1) * 30],
                        y: [0, -60]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.4
                    }}
                    style={{ width: 12, height: 12, top: 80 }}
                />
            ))}
        </AnimatePresence>
    </motion.div>
);

const Agent = ({ age, userName }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [message, setMessage] = useState("Hi! I'm NEMO!");

    useEffect(() => {
        if (!age) {
            setMessage("Yo! I'm NEMO, your learning bestie! Tell me your name so we can vibe together!");
        } else if (age < 7) {
            setMessage(`Hi ${userName}! You're absolute fire today! Ready to play and learn?`);
        } else {
            setMessage(`What's up ${userName}! Ready to crush some reading goals? I got you!`);
        }
    }, [age, userName]);

    const speak = (text) => {
        if (!text) return;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(text);
                const voices = window.speechSynthesis.getVoices();

                // Prioritize Indian English voices for that warm "Indian Mother" feel
                const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
                // Fallback to female/soft voices
                const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Google US English'));

                if (indianVoice) utterance.voice = indianVoice;
                else if (femaleVoice) utterance.voice = femaleVoice;

                utterance.rate = 0.9; // Calm and clear
                utterance.pitch = 1.0; // Warm natural pitch
                utterance.volume = 1.0;

                utterance.onstart = () => setIsSpeaking(true);
                utterance.onend = () => setIsSpeaking(false);
                utterance.onerror = () => setIsSpeaking(false);
                window.speechSynthesis.speak(utterance);
            }, 50);
        }
    };

    // Auto-speak greeting when message changes
    useEffect(() => {
        if (message && message !== "Hi! I'm NEMO!") {
            const timer = setTimeout(() => speak(message), 1000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className="flex flex-col items-center justify-center p-4 relative w-full max-w-2xl mx-auto mb-8">
            <StarfishMascot isSpeaking={isSpeaking} />

            <div className="glass-card p-12 w-full relative text-center border-t-[12px] border-yellow-400 shadow-[0_30px_80px_rgba(0,0,0,0.35)] bg-white/95 mt-[-30px] z-10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rotate-45 border-l-4 border-t-4 border-yellow-100"></div>

                <h2 className="text-3xl font-black text-slate-800 leading-tight mb-8 tracking-tight">
                    {message}
                </h2>

                <div className="flex justify-center items-center gap-6">
                    <button
                        onClick={() => speak(message)}
                        className="ocean-button px-14 py-5 flex items-center gap-5 text-2xl group shadow-[0_15px_40px_rgba(234,179,8,0.3)] bg-gradient-to-r from-yellow-500 to-amber-600 border-none"
                    >
                        <Volume2 size={40} className="group-hover:scale-110 transition-transform" />
                        <span className="font-black uppercase tracking-tighter pr-2">Listen Up!</span>
                    </button>
                    {isSpeaking && (
                        <div className="flex items-center gap-2 text-yellow-600 font-black animate-pulse text-sm uppercase tracking-[0.3em]">
                            <Sparkles size={28} className="text-yellow-400" /> VIBING...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Agent;
export { StarfishMascot };
