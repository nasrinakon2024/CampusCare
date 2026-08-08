import React, { useState, useEffect } from 'react';

const DailySchedule = () => {
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem('dailyTasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    });
    const [time, setTime] = useState('');
    const [taskName, setTaskName] = useState('');

    useEffect(() => {
        localStorage.setItem('dailyTasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (e) => {
        e.preventDefault();
        if (!time || !taskName) return;

        const newTask = {
            id: Date.now(),
            time,
            taskName,
            completed: false
        };

        setTasks([...tasks, newTask]);
        setTime('');
        setTaskName('');
    };

    const toggleComplete = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-bold text-red-500 mb-2">📅 Daily Study Schedule</h3>
            <p className="text-slate-400 text-sm mb-6">Plan your daily routine and track your progress.</p>

            <form onSubmit={addTask} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <input 
                    type="text" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    placeholder="Time (e.g. 10:00 AM)" 
                    className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm" 
                    required 
                />
                <input 
                    type="text" 
                    value={taskName} 
                    onChange={(e) => setTaskName(e.target.value)} 
                    placeholder="Task / Subject (e.g. Math Revision)" 
                    className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm" 
                    required 
                />
                <button type="submit" className="bg-red-600 hover:bg-red-700 p-3 rounded-xl font-bold text-sm transition">
                    Add to Routine
                </button>
            </form>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {tasks.length > 0 ? (
                    tasks.map((t) => (
                        <div key={t.id} className={`flex justify-between items-center p-4 rounded-xl border transition ${t.completed ? 'bg-slate-950/50 border-slate-900 opacity-60 line-through' : 'bg-slate-800/60 border-slate-700'}`}>
                            <div className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    checked={t.completed} 
                                    onChange={() => toggleComplete(t.id)} 
                                    className="w-5 h-5 accent-red-600 rounded cursor-pointer" 
                                />
                                <div>
                                    <span className="text-xs font-mono bg-slate-700 text-red-300 px-2 py-0.5 rounded mr-2">{t.time}</span>
                                    <span className="text-white font-medium">{t.taskName}</span>
                                </div>
                            </div>
                            <button onClick={() => deleteTask(t.id)} className="text-xs bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg transition">
                                Delete
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-500 py-4 text-sm">No schedule added for today yet. Add your tasks above!</p>
                )}
            </div>
        </div>
    );
};

export default DailySchedule;