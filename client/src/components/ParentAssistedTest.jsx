import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Sparkles, Heart, Home, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
    { id: 1, question: "What comes after 'A'?", options: ["B", "C", "D"], answer: "B" },
    { id: 2, question: "What comes before 'Z'?", options: ["X", "Y", "W"], answer: "Y" },
    { id: 3, question: "'A' is for...?", options: ["Apple", "Ball", "Cat"], answer: "Apple" },
    { id: 4, question: "Which letter is a CAPITAL 'B'?", options: ["b", "B", "d"], answer: "B" },
    { id: 5, question: "What comes after 'E'?", options: ["F", "G", "H"], answer: "F" },
    { id: 6, question: "'H' is for...?", options: ["Hat", "Dog", "Egg"], answer: "Hat" },
    { id: 7, question: "What comes before 'M'?", options: ["L", "N", "O"], answer: "L" },
    { id: 8, question: "Which letter comes after 'Q'?", options: ["P", "R", "S"], answer: "R" },
    { id: 9, question: "'C' is for...?", options: ["Cup", "Ant", "Dog"], answer: "Cup" },
    { id: 10, question: "Which letter is 'm' in SMALL?", options: ["M", "n", "m"], answer: "m" },
    { id: 11, question: "What comes after 'S'?", options: ["T", "U", "V"], answer: "T" },
    { id: 12, question: "'F' is for...?", options: ["Fish", "Goat", "Hen"], answer: "Fish" },
    { id: 13, question: "What comes before 'G'?", options: ["E", "F", "H"], answer: "F" },
    { id: 14, question: "What comes after 'J'?", options: ["K", "L", "M"], answer: "K" },
    { id: 15, question: "'M' is for...?", options: ["Moon", "Sun", "Star"], answer: "Moon" },
    { id: 16, question: "Which letter comes before 'P'?", options: ["O", "Q", "R"], answer: "O" },
    { id: 17, question: "What comes after 'W'?", options: ["X", "Y", "Z"], answer: "X" },
    { id: 18, question: "'T' is for...?", options: ["Tiger", "Lion", "Bear"], answer: "Tiger" },
    { id: 19, question: "Which letter is at the end of the alphabet?", options: ["X", "Y", "Z"], answer: "Z" },
    { id: 20, question: "'B' is for...?", options: ["Banana", "Apple", "Cherry"], answer: "Banana" }
];

const ParentAssistedTest = ({ onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const handleOptionSelect = (option) => {
        setAnswers({ ...answers, [currentIndex]: option });
    };

    const calculateScore = () => {
        let score = 0;
        QUESTIONS.forEach((q, index) => {
            if (answers[index] === q.answer) score++;
        });
        return score;
    };

    const nextQuestion = () => {
        if (currentIndex < QUESTIONS.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const prevQuestion = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    if (showResults) {
        const score = calculateScore();
        const isGood = score >= 15;

        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-8 bg-white/90 rounded-[3rem] shadow-2xl border-4 border-white max-w-2xl mx-auto"
            >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isGood ? 'bg-yellow-400' : 'bg-purple-400'} shadow-lg border-4 border-white`}>
                    {isGood ? <Trophy size={48} className="text-white" /> : <Heart size={48} className="text-white" />}
                </div>
                
                <h2 className="text-4xl font-black text-purple-900 mb-4">Test Finished!</h2>
                <p className="text-2xl font-bold text-slate-700 mb-8">
                    Your Score: <span className="text-purple-600">{score}</span> / {QUESTIONS.length}
                </p>

                <div className="bg-purple-50 p-8 rounded-3xl border-2 border-purple-100 mb-8 italic text-lg leading-relaxed text-purple-800">
                    {isGood ? (
                        "“Oh, my clever little star! You did a wonderful job today. Your brain is growing so big and strong! Let's play and learn again tomorrow, okay? Mommy is so proud of you!”"
                    ) : (
                        "“My sweet child, you are doing so well! Learning is like a little adventure, and every step counts. Let's try to learn our ABCs again together—it will be so much fun! You are amazing!”"
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={onClose}
                        className="ocean-button w-full flex items-center justify-center gap-3 py-4 text-xl"
                    >
                        <Home size={24} /> Go Back Home
                    </button>
                </div>
            </motion.div>
        );
    }

    const currentQ = QUESTIONS[currentIndex];

    return (
        <div className="animate-fadeIn max-w-2xl mx-auto pb-10">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-widest text-xs hover:text-purple-600 transition-all bg-white/50 px-4 py-2 rounded-full"
                >
                    <ArrowLeft size={16} /> Exit Test
                </button>
                <div className="bg-purple-600 text-white px-6 py-2 rounded-full font-black text-sm shadow-md">
                    Question {currentIndex + 1} / {QUESTIONS.length}
                </div>
            </div>

            <div className="w-full h-3 bg-purple-100 rounded-full mb-10 overflow-hidden shadow-inner">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-500 shadow-[0_0_10px_#c084fc]"
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card p-10 bg-white shadow-2xl border-2 border-white min-h-[400px] flex flex-col items-center justify-center text-center"
                >
                    <Sparkles className="text-yellow-400 mb-6" size={48} />
                    <h2 className="text-3xl font-black text-slate-800 mb-10 leading-tight">
                        {currentQ.question}
                    </h2>

                    <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                        {currentQ.options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleOptionSelect(option)}
                                className={`
                                    py-4 px-8 rounded-2xl text-xl font-bold transition-all border-4 shadow-sm
                                    ${answers[currentIndex] === option 
                                        ? 'bg-purple-600 text-white border-purple-700 scale-105 shadow-xl' 
                                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-purple-300 hover:bg-purple-50'
                                    }
                                `}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-10">
                <button
                    onClick={prevQuestion}
                    disabled={currentIndex === 0}
                    className="p-5 bg-white rounded-full shadow-lg disabled:opacity-30 text-purple-500 hover:scale-110 active:scale-90 transition-all border-2 border-purple-50"
                >
                    <ChevronLeft size={32} />
                </button>

                {currentIndex === QUESTIONS.length - 1 ? (
                    <button
                        onClick={() => setShowResults(true)}
                        className="ocean-button bg-gradient-to-r from-green-500 to-emerald-600 px-10 py-4 text-xl rounded-full shadow-2xl"
                    >
                        End Test & See Score
                    </button>
                ) : (
                    <button
                        onClick={nextQuestion}
                        className="p-5 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 hover:scale-110 active:scale-90 transition-all border-4 border-white"
                    >
                        <ChevronRight size={32} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ParentAssistedTest;
