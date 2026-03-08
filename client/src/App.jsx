import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Flashcards from './components/Flashcards';
import SummaryChat from './components/SummaryChat';
import Agent, { StarfishMascot } from './components/Agent';
import { RefreshCw, Settings, X, Calendar, ArrowRightCircle, Sparkles } from 'lucide-react';

function App() {
    const [age, setAge] = useState(null);
    const [userName, setUserName] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    // Font Customization
    const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('nemo-font-size')) || 16);
    const [useDyslexicFont, setUseDyslexicFont] = useState(localStorage.getItem('nemo-dyslexic-mode') === 'true');

    // Planning State
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        const savedAge = localStorage.getItem('dyslexia-agent-age');
        const savedName = localStorage.getItem('dyslexia-agent-name');
        if (savedAge) setAge(parseInt(savedAge, 10));
        if (savedName) setUserName(savedName);
    }, []);

    const refreshPlans = () => {
        if (userName) {
            fetch(`http://localhost:3005/api/user-status?user=${userName}`)
                .then(res => res.json())
                .then(data => {
                    if (data.plans) setPlans(data.plans);
                })
                .catch(err => console.error("Error loading plans:", err));
        }
    };

    useEffect(() => {
        refreshPlans();
    }, [userName]);

    const handleOnboardingComplete = (userData) => {
        setAge(userData.age);
        setUserName(userData.name);
        localStorage.setItem('dyslexia-agent-age', userData.age);
        localStorage.setItem('dyslexia-agent-name', userData.name);
    };

    const toggleDyslexic = () => {
        const newVal = !useDyslexicFont;
        setUseDyslexicFont(newVal);
        localStorage.setItem('nemo-dyslexic-mode', newVal);
    };

    const changeFontSize = (size) => {
        setFontSize(size);
        localStorage.setItem('nemo-font-size', size);
    };

    const resetProgress = () => {
        if (confirm("Reset NEMO's memory and restart?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const MagicDust = () => {
        return [...Array(20)].map((_, i) => (
            <div
                key={i}
                className="bubble"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${Math.random() * 3 + 2}s`
                }}
            />
        ));
    };

    const latestPlan = (plans && plans.length > 0) ? plans[0] : null;

    return (
        <div
            className={`relative min-h-screen overflow-hidden ${useDyslexicFont ? 'dyslexic-mode' : ''}`}
            style={{ '--base-size': `${fontSize}px` }}
        >
            {/* Magical Background */}
            <div className="ocean-bg" />
            <div className="magic-dust" />

            {/* Animated Particles */}
            <MagicDust />

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass-nav px-8 py-5 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-5">
                    <div className="bg-yellow-400 p-2 rounded-3xl backdrop-blur-xl border-4 border-white shadow-2xl scale-125 mx-4">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <StarfishMascot isSpeaking={false} />
                        </div>
                    </div>
                    <div className="ml-4">
                        <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-2xl">
                            NEMO
                        </h1>
                        <span className="text-xs text-yellow-400 font-black uppercase tracking-[0.5em] block mt-[-4px]">
                            Champion Mode
                        </span>
                    </div>
                </div>

                <div className="flex gap-5">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-4 text-white hover:bg-white/20 rounded-3xl transition-all shadow-xl border border-white/10 active:scale-90"
                    >
                        <Settings size={32} />
                    </button>
                    <button
                        onClick={resetProgress}
                        className="p-4 text-rose-300 hover:bg-rose-500/20 rounded-3xl transition-all active:scale-90 border border-white/5"
                    >
                        <RefreshCw size={32} />
                    </button>
                </div>
            </nav>

            {/* Settings Overlay */}
            {showSettings && (
                <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setShowSettings(false)}>
                    <div className="glass-card p-12 max-w-lg w-full relative shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-white border-t-[12px] border-cyan-500" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={40} />
                        </button>
                        <h2 className="text-4xl font-black mb-12 text-slate-800 tracking-tight">NEMO Settings</h2>

                        <div className="space-y-12">
                            <div>
                                <label className="flex justify-between items-center mb-6">
                                    <span className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Text Size</span>
                                    <span className="bg-cyan-100 text-cyan-700 px-4 py-1 rounded-full text-sm font-black">{fontSize}px</span>
                                </label>
                                <input
                                    type="range" min="14" max="28" value={fontSize}
                                    onChange={(e) => changeFontSize(parseInt(e.target.value))}
                                    className="w-full h-4 bg-slate-100 rounded-2xl appearance-none cursor-pointer accent-cyan-600"
                                />
                            </div>

                            <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border-4 border-slate-100">
                                <div>
                                    <span className="font-black text-slate-800 text-xl block">Reading Font</span>
                                    <span className="text-sm text-slate-400 font-bold italic">Special font for dyslexia</span>
                                </div>
                                <button
                                    onClick={toggleDyslexic}
                                    className={`w-20 h-12 rounded-full transition-all relative border-4 ${useDyslexicFont ? 'bg-cyan-600 border-cyan-700' : 'bg-slate-300 border-slate-400'}`}
                                >
                                    <div className={`absolute top-1 w-7 h-7 bg-white rounded-full transition-all shadow-xl ${useDyslexicFont ? 'left-9' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="relative z-10 pt-32 pb-40 px-6 flex flex-col items-center min-h-screen">
                <div className="w-full max-w-6xl animate-sway">
                    <Agent age={age} userName={userName} />
                </div>

                <div className="w-full max-w-6xl mt-12">
                    <section className="glass-card overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] min-h-[600px] border-white/50">
                        {!age ? (
                            <Onboarding onComplete={handleOnboardingComplete} />
                        ) : (
                            <div className="p-8 md:p-12">
                                {age < 7
                                    ? <Flashcards onFinish={refreshPlans} />
                                    : <SummaryChat onFinish={refreshPlans} />}
                            </div>
                        )}
                    </section>
                </div>

                {/* Plan Notification */}
                {age && latestPlan && (
                    <div className="fixed bottom-10 right-10 z-[60] w-96 animate-fadeInRight group">
                        <div className="bg-white rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] border-[6px] border-cyan-100 p-10 transform group-hover:-translate-y-4 transition-all duration-500 cursor-pointer">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3 bg-cyan-50 px-4 py-2 rounded-2xl">
                                    <Calendar className="text-cyan-600" size={24} />
                                    <span className="text-sm font-black text-cyan-800 tracking-tighter">{latestPlan.date}</span>
                                </div>
                                <div className="animate-pulse bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm">
                                    New Task!
                                </div>
                            </div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Your Next Adventure</h4>
                            <p className="text-slate-900 font-black text-2xl leading-tight mb-6">
                                "{latestPlan.goal}"
                            </p>
                            <div className="flex items-center gap-3 text-cyan-500 text-sm font-black group-hover:text-cyan-700 transition-colors">
                                <ArrowRightCircle size={24} />
                                <span className="uppercase tracking-widest">Ready whenever you are!</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="fixed bottom-10 left-12 text-white/40 text-[11px] font-black tracking-[0.5em] uppercase pointer-events-none">
                {userName ? `NEMO HUB | ${userName}` : 'NEMO LEARNING'}
            </footer>
        </div>
    );
}

export default App;
