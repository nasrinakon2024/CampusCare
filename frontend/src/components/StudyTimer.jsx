import React, { useState, useEffect } from 'react';

const StudyTimer = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [timerType, setTimerType] = useState('Study');
    const [customMinutes, setCustomMinutes] = useState('');

    useEffect(() => {
        let interval = null;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            alert(timerType === 'Study' ? "Great job! Time for a break." : "Break over! Back to studying.");
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft, timerType]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = (minutes, type) => {
        setIsRunning(false);
        setTimeLeft(minutes * 60);
        setTimerType(type);
    };

    const handleCustomTime = (e) => {
        e.preventDefault();
        const mins = parseInt(customMinutes);
        if (mins > 0) {
            resetTimer(mins, 'Study');
            setCustomMinutes('');
        } else {
            alert("Please enter valid minutes!");
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-center">
            <h3 className="text-2xl font-bold text-red-500 mb-2">⏱️ Study Timer</h3>
            <p className="text-slate-400 text-sm mb-6">Focus on your studies with custom or preset time.</p>

            <div className="flex justify-center gap-2 mb-4 flex-wrap">
                <button 
                    onClick={() => resetTimer(25, 'Study')} 
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition">
                    25m
                </button>
                <button 
                    onClick={() => resetTimer(45, 'Study')} 
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition">
                    45m
                </button>
                <button 
                    onClick={() => resetTimer(60, 'Study')} 
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition">
                    1 Hour (60m)
                </button>
                <button 
                    onClick={() => resetTimer(5, 'Break')} 
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition">
                    Break (5m)
                </button>
            </div>

            {/* Custom Time Input for any custom minutes/hours */}
            <form onSubmit={handleCustomTime} className="flex justify-center gap-2 mb-6">
                <input 
                    type="number" 
                    value={customMinutes} 
                    onChange={(e) => setCustomMinutes(e.target.value)} 
                    placeholder="Custom minutes (e.g. 60)" 
                    className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs w-44 text-center focus:outline-none focus:border-red-500"
                    min="1"
                />
                <button type="submit" className="bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-xl text-xs font-bold transition">
                    Set Time
                </button>
            </form>

            <div className="text-6xl font-mono font-bold tracking-widest mb-6 text-white bg-slate-950 py-6 rounded-2xl border border-slate-800 shadow-inner">
                {formatTime(timeLeft)}
            </div>

            <div className="flex justify-center gap-4">
                <button 
                    onClick={toggleTimer} 
                    className={`px-8 py-3 rounded-xl font-bold transition shadow-lg ${isRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'}`}>
                    {isRunning ? 'Pause Timer' : 'Start Focus'}
                </button>
                <button 
                    onClick={() => resetTimer(25, 'Study')} 
                    className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl font-bold transition">
                    Reset
                </button>
            </div>
        </div>
    );
};

export default StudyTimer;