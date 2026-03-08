import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Volume2, Trophy, Star, CheckCircle, Edit3, ArrowRightCircle, Rocket, PartyPopper } from 'lucide-react';
import { ALPHABET_DATA, NUMBERS_DATA, TABLES_DATA, DOMESTIC_ANIMALS_DATA, WILD_ANIMALS_DATA, NATURE_DATA } from '../data/learningContent';
import TracingCanvas from './TracingCanvas';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
    { id: 'alphabet', label: 'ABC Phonics', emoji: '🅰️', color: 'bg-white', accent: 'text-rose-500', data: ALPHABET_DATA },
    { id: 'numbers', label: 'Numbers', emoji: '🔢', color: 'bg-white', accent: 'text-blue-500', data: NUMBERS_DATA },
    { id: 'tables', label: 'Tables 1-12', emoji: '✖️', color: 'bg-white', accent: 'text-indigo-500', data: TABLES_DATA },
    { id: 'domestic', label: 'Lovely Pets', emoji: '🐶', color: 'bg-white', accent: 'text-orange-500', data: DOMESTIC_ANIMALS_DATA },
    { id: 'wild', label: 'Wild Jungle', emoji: '🦁', color: 'bg-white', accent: 'text-amber-500', data: WILD_ANIMALS_DATA },
    { id: 'nature', label: 'Nature', emoji: '🌈', color: 'bg-white', accent: 'text-emerald-500', data: NATURE_DATA }
];

const Flashcards = (props) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [showTracing, setShowTracing] = useState(false);
    const [showRocket, setShowRocket] = useState(false);

    const user = localStorage.getItem('dyslexia-agent-name') || 'student';
    const age = localStorage.getItem('dyslexia-agent-age') || 5;
    const currentData = selectedCategory ? selectedCategory.data : [];
    const currentCard = currentData[currentIndex];

    // Soft, polite speech
    const speak = (text) => {
        if (!text) return;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(text);
                const voices = window.speechSynthesis.getVoices();
                // Prefer soft female voice
                const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Female'));
                if (preferredVoice) utterance.voice = preferredVoice;

                utterance.rate = 0.85; // Slower, more polite
                utterance.pitch = 1.1; // Slightly higher but soft
                utterance.volume = 0.8; // Not too loud
                window.speechSynthesis.speak(utterance);
            }, 50);
        }
    };

    // Auto-speak card content
    useEffect(() => {
        if (currentCard && !showTracing && !completed) {
            // Priority: Phonics (full explanation) > Word > Letter
            const textToSpeak = currentCard.phonics || currentCard.word || currentCard.letter;
            const timer = setTimeout(() => speak(textToSpeak), 500);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, selectedCategory, showTracing, completed]);

    const handleNext = () => {
        if (currentIndex < currentData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCompleted(true);
            triggerCelebration();
        }
    };

    const triggerCelebration = () => {
        setShowRocket(true);
        setTimeout(() => setShowRocket(false), 5000);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const finishLesson = async () => {
        try {
            await fetch('http://localhost:3005/api/log-lesson', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, lesson: selectedCategory.label })
            });

            await fetch('http://localhost:3005/api/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, age })
            });

            if (props.onFinish) props.onFinish();

            // FULL RESET
            setSelectedCategory(null);
            setCompleted(false);
            setCurrentIndex(0);
            setShowRocket(false);
        } catch (e) {
            console.error("Finish error", e);
            setSelectedCategory(null);
            setCompleted(false);
        }
    };

    if (!selectedCategory) {
        return (
            <div className="animate-fadeIn p-2 w-full max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8 bg-white/60 p-6 rounded-[2rem] border-2 border-white/50 shadow-lg backdrop-blur-md">
                    <div className="p-3 bg-purple-600 rounded-xl shadow-md text-white animate-pulse">
                        <Star size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-purple-900">Choose Your Magic Spell</h2>
                        <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mt-1">What magic shall we learn?</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat)}
                            className={`${cat.color} p-6 rounded-[2rem] border-2 border-white/50 flex flex-col items-center gap-4 group hover:-translate-y-2 transition-all shadow-lg active:scale-95 hover:border-purple-300`}
                        >
                            <span className="text-5xl group-hover:scale-110 transition-transform filter drop-shadow-md">{cat.emoji}</span>
                            <span className={`text-sm font-bold ${cat.accent} uppercase tracking-wide`}>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="text-center p-10 animate-fadeIn min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
                <AnimatePresence>
                    {showRocket && (
                        <motion.div
                            initial={{ y: 500, x: -100 }}
                            animate={{ y: -800, x: 200 }}
                            transition={{ duration: 3, ease: "easeIn" }}
                            className="absolute z-50 pointer-events-none"
                        >
                            <Rocket size={80} className="text-yellow-500 fill-current rotate-[-15deg] drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative z-10 w-full max-w-lg bg-white/80 p-8 rounded-[3rem] border-4 border-white shadow-xl backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mb-6"
                    >
                        <div className="bg-yellow-400 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(250,204,21,0.6)] border-4 border-white">
                            <Trophy size={48} className="text-white fill-current" />
                        </div>
                    </motion.div>

                    <h2 className="text-3xl font-black text-purple-900 mb-2 tracking-tight">Magical!</h2>
                    <p className="text-sm text-purple-600 font-bold mb-8 uppercase tracking-widest px-4 py-1 bg-purple-100 rounded-full inline-block">
                        Spell Complete
                    </p>

                    <button
                        onClick={finishLesson}
                        className="ocean-button w-full py-4 text-lg flex items-center justify-center gap-3 shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600"
                    >
                        Collect Magic Dust <ArrowRightCircle size={24} />
                    </button>
                </div>
            </div>
        );
    }

    const canTrace = currentCard && (currentCard.letter || currentCard.number) && !currentCard.equation;

    return (
        <div className="animate-fadeIn max-w-2xl mx-auto pb-10">
            {showTracing && (
                <TracingCanvas
                    target={currentCard.letter || currentCard.number}
                    onClose={() => setShowTracing(false)}
                />
            )}

            <button
                onClick={() => setSelectedCategory(null)}
                className="mb-6 flex items-center gap-2 text-purple-300 font-bold uppercase tracking-widest hover:text-purple-600 transition-all text-xs"
            >
                <ChevronLeft size={16} /> Back
            </button>

            <div className="flex flex-col items-center">
                {/* Visual Progress Bar */}
                <div className="w-full h-3 bg-purple-100 rounded-full mb-8 overflow-hidden shadow-inner">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / currentData.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card w-full p-8 flex flex-col items-center text-center relative bg-white/90 shadow-xl border-2 border-white"
                    >
                        {/* Smaller, cleaner layout */}
                        <div className="mb-6">
                            {currentCard.emoji && <div className="text-8xl mb-4 drop-shadow-md animate-pulse">{currentCard.emoji}</div>}
                            {!currentCard.emoji && (currentCard.letter || currentCard.number) && (
                                <div className="text-8xl font-black text-purple-900 mb-4 tracking-tighter drop-shadow-sm">
                                    {currentCard.letter || currentCard.number}
                                </div>
                            )}
                        </div>

                        <div className="mb-6 w-full">
                            {currentCard.word && <h3 className="text-3xl font-bold text-slate-700 mb-2">{currentCard.word}</h3>}

                            {/* Equation/Table Display */}
                            {currentCard.equation && (
                                <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-100 text-left w-full mx-auto shadow-inner">
                                    {currentCard.equation.split('\n').map((line, idx) => (
                                        <div key={idx} className="text-xl font-bold text-purple-800 py-1 border-b border-purple-200 last:border-0">{line}</div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex gap-4 mt-2">
                            <button
                                onClick={() => speak(currentCard.phonics || currentCard.word)}
                                className="bg-purple-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-600 hover:scale-110 transition-all border-4 border-white"
                            >
                                <Volume2 size={24} />
                            </button>

                            {canTrace && (
                                <button
                                    onClick={() => setShowTracing(true)}
                                    className="bg-pink-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-pink-600 hover:scale-110 transition-all border-4 border-white"
                                >
                                    <Edit3 size={24} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="flex gap-8 mt-10">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="p-4 bg-white/80 rounded-full shadow-md disabled:opacity-30 hover:bg-white transition-all text-purple-400"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="ocean-button px-8 py-3 rounded-full shadow-lg hover:scale-105"
                    >
                        <ChevronRight size={24} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Flashcards;
