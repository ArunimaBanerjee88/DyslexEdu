import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Pencil, X, CheckCircle } from 'lucide-react';

const TracingCanvas = ({ target, onClose }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Setup canvas for high DPI
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#2563eb';
    }, []);

    const startDrawing = (e) => {
        const { offsetX, offsetY } = getCoordinates(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getCoordinates(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches[0]) {
            return {
                offsetX: e.touches[0].clientX - rect.left,
                offsetY: e.touches[0].clientY - rect.top
            };
        }
        return {
            offsetX: e.nativeEvent.offsetX,
            offsetY: e.nativeEvent.offsetY
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border-4 border-blue-200">
                <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-4">
                        <Pencil size={24} />
                        <h3 className="text-2xl font-black tracking-tight">Practice Writing "{target}"</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
                        <X size={28} />
                    </button>
                </div>

                <div className="relative aspect-square md:aspect-video bg-slate-50 flex items-center justify-center">
                    {/* Background Guide */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
                        <span className="text-[300px] font-black">{target}</span>
                    </div>

                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="relative z-10 w-full h-full cursor-crosshair touch-none"
                    />
                </div>

                <div className="p-6 bg-slate-100 flex justify-between items-center">
                    <button
                        onClick={clearCanvas}
                        className="flex items-center gap-2 bg-white text-slate-600 px-6 py-3 rounded-2xl font-black hover:bg-slate-50 border-2 border-slate-200 shadow-sm transition"
                    >
                        <Eraser size={20} /> CLEAR
                    </button>

                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 bg-green-600 text-white px-10 py-3 rounded-2xl font-black hover:bg-green-700 shadow-lg transition"
                    >
                        <CheckCircle size={20} /> I'M DONE!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TracingCanvas;
