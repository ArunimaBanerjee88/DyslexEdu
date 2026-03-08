import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Mic, MicOff, Star, Sparkles, Volume2 } from 'lucide-react';
import { StarfishMascot } from './Agent';

const Onboarding = ({ onComplete }) => {
    const [name, setName] = useState('');
    const [step, setStep] = useState(1);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const speechToText = event.results[0][0].transcript;
                setName(speechToText.replace(/[.!]/g, ''));
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech error", event.error);
                setIsListening(false);
            };
        }
    }, []);

    const startListening = () => {
        if (recognitionRef.current) {
            setIsListening(true);
            recognitionRef.current.start();
        } else {
            alert("Voice recognition is not supported in this browser. Please type your name!");
        }
    };

    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) setStep(2);
    };

    const handleAgeSelect = (selectedAge) => {
        onComplete({ name, age: selectedAge });
    };

    if (step === 1) {
        return (
            <div className="flex flex-col items-center animate-fadeIn p-12 text-center min-h-[500px] justify-center">
                <div className="relative mb-14">
                    <div className="absolute inset-0 bg-yellow-300 blur-3xl opacity-20 animate-pulse"></div>
                    <StarfishMascot isSpeaking={false} />
                </div>

                <h2 className="text-5xl font-black text-slate-800 mb-6 tracking-tight">
                    Welcome to <span className="text-blue-600">NEMO</span>!
                </h2>
                <p className="text-2xl text-slate-400 mb-12 font-bold uppercase tracking-[0.2em]">
                    Tell me your name!
                </p>

                <div className="flex flex-col w-full max-w-lg gap-8">
                    <div className="relative group">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Type or Speak your name..."
                            className="w-full text-3xl p-8 rounded-[3rem] border-4 border-slate-100 focus:border-yellow-400 outline-none text-center bg-white shadow-2xl font-black transition-all"
                        />

                        <button
                            type="button"
                            onClick={startListening}
                            className={`absolute right-4 top-4 w-20 h-20 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 scale-110 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isListening ? <MicOff className="text-white" size={32} /> : <Mic className="text-white" size={32} />}
                        </button>

                        <div className="absolute -top-4 -left-4 bg-yellow-400 p-2 rounded-2xl rotate-[-12deg] shadow-lg border-2 border-white">
                            <span className="text-white font-black text-xs uppercase px-2 tracking-widest">Voice Active</span>
                        </div>
                    </div>

                    {name.trim() && (
                        <button
                            onClick={handleNameSubmit}
                            className="ocean-button py-8 text-3xl flex items-center justify-center gap-6 shadow-2xl animate-fadeIn"
                        >
                            LET'S VIBE! <ArrowRight size={48} />
                        </button>
                    )}
                </div>

                <p className="mt-12 text-slate-300 font-black text-xs uppercase tracking-[0.5em]">
                    Your Privacy is our first Rule
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center animate-fadeIn p-10">
            <h2 className="text-6xl font-black text-slate-800 text-center mb-4 tracking-tighter">
                Yo, <span className="text-yellow-500">{name.toUpperCase()}</span>!
            </h2>
            <div className="bg-yellow-100 text-yellow-700 px-8 py-2 rounded-full mb-16 font-black uppercase text-sm tracking-widest border-2 border-yellow-200">
                Pick Your Learning Mode
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl">
                <button
                    onClick={() => handleAgeSelect(4)}
                    className="group bg-white hover:bg-slate-50 border-4 border-slate-100 hover:border-blue-400 p-12 rounded-[4rem] flex flex-col items-center transition-all shadow-[0_30px_60px_rgba(0,0,0,0.1)] hover:-translate-y-4 active:scale-95 text-center"
                >
                    <span className="text-[120px] mb-8 group-hover:scale-125 transition-transform duration-500">🐠</span>
                    <span className="text-4xl font-black text-blue-600 mb-4 tracking-tight">Age 4 to 7</span>
                    <p className="text-2xl text-slate-400 font-bold leading-relaxed max-w-[320px]">
                        Basic <span className="text-slate-800">Reading</span> & <span className="text-slate-800">Numbers</span>!
                    </p>
                    <div className="mt-10 flex items-center gap-3 text-blue-500 font-black uppercase text-xs">
                        <Sparkles size={20} /> Foundation Mode
                    </div>
                </button>

                <button
                    onClick={() => handleAgeSelect(12)}
                    className="group bg-slate-900 border-4 border-slate-800 hover:border-yellow-400 p-12 rounded-[4rem] flex flex-col items-center transition-all shadow-2xl hover:-translate-y-4 active:scale-95 text-center"
                >
                    <span className="text-[120px] mb-8 group-hover:scale-125 transition-transform duration-500">🧠</span>
                    <span className="text-4xl font-black text-white mb-4 tracking-tight">Age 8+</span>
                    <p className="text-2xl text-slate-400 font-bold leading-relaxed max-w-[320px]">
                        Story <span className="text-white">Summaries</span> & <span className="text-white">Help</span>!
                    </p>
                    <div className="mt-10 flex items-center gap-3 text-yellow-400 font-black uppercase text-xs">
                        <Sparkles size={20} /> Pro Mode
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Onboarding;
