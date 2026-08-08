import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CourseNotes = () => {
    const [courseTitle, setCourseTitle] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [department, setDepartment] = useState('English');
    const [qaList, setQaList] = useState([{ question: '', answer: '' }]);
    const [file, setFile] = useState(null);
    const [notesList, setNotesList] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
    
    // PDF Modal Viewer State
    const [viewingPdfUrl, setViewingPdfUrl] = useState(null);

    // Calculator State
    const [calcDisplay, setCalcDisplay] = useState('0');

    // Reminder / Deadlines State
    const [reminders, setReminders] = useState(() => {
        const saved = localStorage.getItem('studyReminders');
        return saved ? JSON.parse(saved) : [];
    });
    const [taskTitle, setTaskTitle] = useState('');
    const [taskType, setTaskType] = useState('Assignment');
    const [taskDate, setTaskDate] = useState('');

    // Daily Goals / Checklist State
    const [dailyGoals, setDailyGoals] = useState(() => {
        const saved = localStorage.getItem('dailyStudyGoals');
        return saved ? JSON.parse(saved) : [];
    });
    const [goalInput, setGoalInput] = useState('');

    // Flashcards State
    const [flashcards, setFlashcards] = useState(() => {
        const saved = localStorage.getItem('studyFlashcards');
        return saved ? JSON.parse(saved) : [
            { id: 1, front: "What is Romanticism?", back: "A literary movement emphasizing nature, emotion, and individualism (Late 18th - Mid 19th century)." },
            { id: 2, front: "What is a Component in React?", back: "Independent, reusable bits of code that return HTML via JSX." }
        ];
    });
    const [cardFront, setCardFront] = useState('');
    const [cardBack, setCardBack] = useState('');
    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Dictionary / Translator State
    const [searchWord, setSearchWord] = useState('');
    const [wordResult, setWordResult] = useState(null);
    const [loadingWord, setLoadingWord] = useState(false);

    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    const departmentsList = ['English', 'CSE', 'BBA', 'Economics', 'Mathematics', 'Physics', 'Law', 'Others'];

    const fetchNotes = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:5000/api/notes/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setNotesList(data);
            }
        } catch (err) {
            console.error("Error fetching notes:", err);
        }
    };

    useEffect(() => {
        if (!userId) {
            navigate('/login');
        } else {
            fetchNotes();
        }
    }, [userId, navigate]);

    useEffect(() => {
        localStorage.setItem('studyReminders', JSON.stringify(reminders));
    }, [reminders]);

    useEffect(() => {
        localStorage.setItem('dailyStudyGoals', JSON.stringify(dailyGoals));
    }, [dailyGoals]);

    useEffect(() => {
        localStorage.setItem('studyFlashcards', JSON.stringify(flashcards));
    }, [flashcards]);

    const handleAddQaRow = () => {
        setQaList([...qaList, { question: '', answer: '' }]);
    };

    const handleRemoveQaRow = (index) => {
        if (qaList.length === 1) return;
        const list = [...qaList];
        list.splice(index, 1);
        setQaList(list);
    };

    const handleQaChange = (index, field, value) => {
        const list = [...qaList];
        list[index][field] = value;
        setQaList(list);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('courseTitle', courseTitle);
        formData.append('courseCode', courseCode);
        formData.append('department', department);
        formData.append('qaList', JSON.stringify(qaList));
        if (file) {
            formData.append('file', file);
        }

        try {
            let url = 'http://localhost:5000/api/notes/add';
            let method = 'POST';

            if (editingId) {
                url = `http://localhost:5000/api/notes/edit/${editingId}`;
                method = 'PUT';
            }

            const res = await fetch(url, {
                method: method,
                body: formData
            });
            
            const data = await res.json();
            if (res.ok) {
                alert(editingId ? "Note / Book updated successfully!" : "Note / Book saved successfully!");
                setCourseTitle('');
                setCourseCode('');
                setDepartment('English');
                setQaList([{ question: '', answer: '' }]);
                setFile(null);
                setEditingId(null);
                fetchNotes();
            } else {
                alert("Failed: " + data.error);
            }
        } catch (err) {
            console.error("Error saving note:", err);
            alert("Server connection failed!");
        }
    };

    const handleEdit = (note) => {
        setEditingId(note._id);
        setCourseTitle(note.courseTitle || '');
        setCourseCode(note.courseCode || '');
        setDepartment(note.department || 'English');
        if (note.qaList && Array.isArray(note.qaList) && note.qaList.length > 0) {
            setQaList(note.qaList);
        } else {
            setQaList([{ question: note.question || note.notesContent || '', answer: note.answer || '' }]);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this note/book?")) {
            try {
                const res = await fetch(`http://localhost:5000/api/notes/${id}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    alert("Deleted successfully!");
                    fetchNotes();
                }
            } catch (err) {
                console.error("Error deleting note:", err);
            }
        }
    };

    const toggleHighlight = async (note) => {
        try {
            const res = await fetch(`http://localhost:5000/api/notes/edit/${note._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...note, 
                    isHighlighted: !note.isHighlighted 
                })
            });
            if (res.ok) {
                fetchNotes();
            }
        } catch (err) {
            console.error("Error highlighting note:", err);
        }
    };

    // Calculator Functions
    const handleCalcBtnClick = (val) => {
        if (calcDisplay === '0' || calcDisplay === 'Error') {
            setCalcDisplay(val);
        } else {
            setCalcDisplay(calcDisplay + val);
        }
    };

    const handleClearCalc = () => {
        setCalcDisplay('0');
    };

    const handleCalculateResult = () => {
        try {
            const result = Function('"use strict";return (' + calcDisplay + ')')();
            setCalcDisplay(String(result));
        } catch (err) {
            setCalcDisplay('Error');
        }
    };

    // Reminder Functions
    const handleAddReminder = (e) => {
        e.preventDefault();
        if (!taskTitle || !taskDate) return;
        const newReminder = {
            id: Date.now(),
            taskTitle,
            taskType,
            taskDate
        };
        setReminders([...reminders, newReminder]);
        setTaskTitle('');
        setTaskDate('');
    };

    const handleDeleteReminder = (id) => {
        setReminders(reminders.filter(item => item.id !== id));
    };

    // Daily Goals Functions
    const handleAddGoal = (e) => {
        e.preventDefault();
        if (!goalInput.trim()) return;
        const newGoal = {
            id: Date.now(),
            text: goalInput,
            completed: false
        };
        setDailyGoals([...dailyGoals, newGoal]);
        setGoalInput('');
    };

    const toggleGoalComplete = (id) => {
        setDailyGoals(dailyGoals.map(goal => 
            goal.id === id ? { ...goal, completed: !goal.completed } : goal
        ));
    };

    const handleDeleteGoal = (id) => {
        setDailyGoals(dailyGoals.filter(goal => goal.id !== id));
    };

    // Flashcard Functions
    const handleAddFlashcard = (e) => {
        e.preventDefault();
        if (!cardFront.trim() || !cardBack.trim()) return;
        const newCard = {
            id: Date.now(),
            front: cardFront,
            back: cardBack
        };
        setFlashcards([...flashcards, newCard]);
        setCardFront('');
        setCardBack('');
    };

    const handleDeleteFlashcard = (id) => {
        const updated = flashcards.filter(c => c.id !== id);
        setFlashcards(updated);
        if (activeCardIndex >= updated.length && updated.length > 0) {
            setActiveCardIndex(updated.length - 1);
        }
    };

    const handleNextCard = () => {
        setIsFlipped(false);
        setActiveCardIndex((prev) => (prev + 1) % flashcards.length);
    };

    const handlePrevCard = () => {
        setIsFlipped(false);
        setActiveCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    };

    // Translation Function
    const handleTranslateWord = async (e) => {
        e.preventDefault();
        if (!searchWord.trim()) return;
        setLoadingWord(true);
        setWordResult(null);

        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q=${encodeURIComponent(searchWord)}`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data && data[0]) {
                const translatedText = data[0].map(item => item[0]).join('');
                setWordResult({
                    query: searchWord,
                    translation: translatedText
                });
            } else {
                setWordResult({ query: searchWord, translation: "Translation not found." });
            }
        } catch (err) {
            console.error("Translation error:", err);
            setWordResult({ query: searchWord, translation: "Error fetching translation." });
        } finally {
            setLoadingWord(false);
        }
    };

    // Filter notes based on department and search input
    const filteredNotes = notesList.filter((note) => {
        const noteDept = note.department || 'English';
        const matchesDept = selectedDeptFilter === 'All' || noteDept === selectedDeptFilter;

        const query = searchTerm.toLowerCase();
        const matchesTitle = note.courseTitle && note.courseTitle.toLowerCase().includes(query);
        const matchesCode = note.courseCode && note.courseCode.toLowerCase().includes(query);
        const matchesQa = note.qaList && note.qaList.some(
            (item) => item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query)
        );

        return matchesDept && (matchesTitle || matchesCode || matchesQa || query === '');
    });

    return (
        <div className="min-h-screen flex flex-col justify-between text-white relative">
            <div className="p-6 max-w-5xl mx-auto w-full">
                <h2 className="text-3xl font-bold mb-8 text-center text-red-500">📚 Study Dashboard & Online Library</h2>
                
                {/* Top Tools Section: 5 Widgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                    
                    {/* 1. Daily Study Goals Widget */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold mb-3 text-red-400 flex items-center gap-1.5">
                                <span>🎯</span> Daily Goals
                            </h3>
                            
                            <form onSubmit={handleAddGoal} className="space-y-2 mb-3">
                                <input 
                                    type="text" 
                                    value={goalInput} 
                                    onChange={(e) => setGoalInput(e.target.value)} 
                                    placeholder="Add today's goal..." 
                                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs" 
                                />
                                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition p-1.5">
                                    + Add Goal
                                </button>
                            </form>

                            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                {dailyGoals.length > 0 ? (
                                    dailyGoals.map((goal) => (
                                        <div key={goal.id} className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <input 
                                                    type="checkbox" 
                                                    checked={goal.completed} 
                                                    onChange={() => toggleGoalComplete(goal.id)}
                                                    className="accent-red-600 rounded cursor-pointer"
                                                />
                                                <span className={`truncate ${goal.completed ? 'line-through text-slate-500' : 'text-white'}`}>{goal.text}</span>
                                            </div>
                                            <button onClick={() => handleDeleteGoal(goal.id)} className="text-slate-500 hover:text-red-400 font-bold px-1">✕</button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-[11px] text-center py-2">No goals set for today.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Quick Flashcards Widget */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold mb-2 text-red-400 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">🧠 Flashcards</span>
                                {flashcards.length > 0 && (
                                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                                        {activeCardIndex + 1}/{flashcards.length}
                                    </span>
                                )}
                            </h3>

                            {flashcards.length > 0 ? (
                                <div 
                                    onClick={() => setIsFlipped(!isFlipped)} 
                                    className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 h-28 flex flex-col justify-between cursor-pointer hover:border-red-500/50 transition relative group"
                                >
                                    <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex justify-between">
                                        <span>{isFlipped ? "Answer (Click to flip)" : "Question (Click to flip)"}</span>
                                        <span className="text-slate-500 group-hover:text-white">🔄</span>
                                    </div>
                                    <p className="text-xs text-white text-center font-medium my-auto overflow-y-auto max-h-14">
                                        {isFlipped ? flashcards[activeCardIndex].back : flashcards[activeCardIndex].front}
                                    </p>
                                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/80 text-[10px]">
                                        <button type="button" onClick={(e) => { e.stopPropagation(); handlePrevCard(); }} className="text-slate-400 hover:text-white">◀ Prev</button>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteFlashcard(flashcards[activeCardIndex].id); }} className="text-red-500 hover:text-red-400 font-bold">Delete</button>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleNextCard(); }} className="text-slate-400 hover:text-white">Next ▶</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-500 text-[11px] text-center py-6">No flashcards available.</p>
                            )}

                            <form onSubmit={handleAddFlashcard} className="mt-2 space-y-1.5">
                                <input 
                                    type="text" 
                                    value={cardFront} 
                                    onChange={(e) => setCardFront(e.target.value)} 
                                    placeholder="Front (Question)" 
                                    className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-[10px]" 
                                />
                                <input 
                                    type="text" 
                                    value={cardBack} 
                                    onChange={(e) => setCardBack(e.target.value)} 
                                    placeholder="Back (Answer)" 
                                    className="w-full p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-[10px]" 
                                />
                                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[10px] transition p-1">
                                    + Add Card
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* 3. Academic Deadlines Widget */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold mb-3 text-red-400 flex items-center gap-1.5">
                                <span>⏰</span> Deadlines
                            </h3>
                            
                            <form onSubmit={handleAddReminder} className="space-y-2 mb-3">
                                <input 
                                    type="text" 
                                    value={taskTitle} 
                                    onChange={(e) => setTaskTitle(e.target.value)} 
                                    placeholder="Task title..." 
                                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs" 
                                    required 
                                />
                                <div className="grid grid-cols-2 gap-1.5">
                                    <select 
                                        value={taskType} 
                                        onChange={(e) => setTaskType(e.target.value)} 
                                        className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-[10px]"
                                    >
                                        <option value="Assignment">Assignment</option>
                                        <option value="Presentation">Presentation</option>
                                        <option value="Class Test">Class Test</option>
                                    </select>
                                    <input 
                                        type="date" 
                                        value={taskDate} 
                                        onChange={(e) => setTaskDate(e.target.value)} 
                                        className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-[10px]" 
                                        required 
                                    />
                                </div>
                                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition p-1.5">
                                    + Add Reminder
                                </button>
                            </form>

                            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                {reminders.length > 0 ? (
                                    reminders.map((item) => (
                                        <div key={item.id} className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                                            <div className="truncate">
                                                <span className="font-semibold text-white truncate block">{item.taskTitle}</span>
                                                <p className="text-slate-400 text-[10px]">📅 {item.taskDate}</p>
                                            </div>
                                            <button onClick={() => handleDeleteReminder(item.id)} className="text-slate-500 hover:text-red-400 font-bold px-1">✕</button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-[11px] text-center py-2">No deadlines.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 4. Dictionary & Translator Widget */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold mb-3 text-red-400 flex items-center gap-1.5">
                                <span>📖</span> Dictionary
                            </h3>
                            
                            <form onSubmit={handleTranslateWord} className="space-y-2 mb-2">
                                <textarea 
                                    value={searchWord} 
                                    onChange={(e) => setSearchWord(e.target.value)} 
                                    placeholder="Type word/sentence..." 
                                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs resize-none" 
                                    rows="2"
                                    required 
                                />
                                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition p-1.5">
                                    {loadingWord ? "Translating..." : "🔍 Translate"}
                                </button>
                            </form>

                            {wordResult && (
                                <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-[11px]">
                                    <p className="text-slate-400 truncate">En: <span className="text-white">{wordResult.query}</span></p>
                                    <p className="text-red-400 font-semibold mt-0.5 truncate">🇧🇩 {wordResult.translation}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 5. Mini Calculator Widget */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold mb-2 text-red-400 flex items-center gap-1.5">
                                <span>🧮</span> Calculator
                            </h3>
                            <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl mb-2 text-right overflow-x-auto">
                                <span className="text-sm font-mono text-white">{calcDisplay}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1">
                            <button onClick={handleClearCalc} className="bg-red-950/60 hover:bg-red-900 text-red-400 p-1 rounded font-bold text-[10px] col-span-2">C</button>
                            <button onClick={() => handleCalcBtnClick('/')} className="bg-slate-800 hover:bg-slate-700 text-red-400 p-1 rounded font-bold text-[10px]">÷</button>
                            <button onClick={() => handleCalcBtnClick('*')} className="bg-slate-800 hover:bg-slate-700 text-red-400 p-1 rounded font-bold text-[10px]">×</button>

                            <button onClick={() => handleCalcBtnClick('7')} className="bg-slate-800 text-white p-1 rounded font-bold text-[10px]">7</button>
                            <button onClick={() => handleCalcBtnClick('8')} className="bg-slate-800 text-white p-1 rounded font-bold text-[10px]">8</button>
                            <button onClick={() => handleCalcBtnClick('9')} className="bg-slate-800 text-white p-1 rounded font-bold text-[10px]">9</button>
                            <button onClick={() => handleCalcBtnClick('-')} className="bg-slate-800 text-red-400 p-1 rounded font-bold text-[10px]">-</button>

                            <button onClick={() => handleCalcBtnClick('4')} className="bg-slate-800 text-white p-1 rounded font-bold text-[10px]">4</button>
                            <button onClick={() => handleCalcBtnClick('5')} className="bg-slate-800 text-white p-1 rounded font-bold text-[10px]">5</button>
                            <button onClick={() => handleCalcBtnClick('6')} className="bg-slate-800 text-white p-1 rounded font-bold text-[10px]">6</button>
                            <button onClick={() => handleCalcBtnClick('+')} className="bg-slate-800 text-red-400 p-1 rounded font-bold text-[10px]">+</button>

                            <button onClick={() => handleCalcBtnClick('1')} className="bg-slate-800 text-white p-1 rounded font-bold text-[10px]">1</button>
                            <button onClick={() => handleCalcBtnClick('2')} className="bg-slate-800 text-white p-1 rounded font-bold text-[10px]">2</button>
                            <button onClick={() => handleCalcBtnClick('3')} className="bg-slate-800 text-white p-1 rounded font-bold text-[10px]">3</button>
                            <button onClick={handleCalculateResult} className="bg-red-600 text-white p-1 rounded font-bold text-[10px] row-span-2 flex items-center justify-center">=</button>

                            <button onClick={() => handleCalcBtnClick('0')} className="bg-slate-800 text-white p-1 rounded font-bold text-[10px] col-span-2">0</button>
                            <button onClick={() => handleCalcBtnClick('.')} className="bg-slate-800 text-white p-1 rounded font-bold text-[10px]">.</button>
                        </div>
                    </div>

                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-10 shadow-xl">
                    <h3 className="text-xl font-semibold mb-4 text-red-400">{editingId ? "Edit Note / Online Book" : "Add New Note or Online Book"}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input 
                            type="text" 
                            value={courseTitle} 
                            onChange={(e) => setCourseTitle(e.target.value)} 
                            placeholder="Course / Book Title (e.g. Shakespeare / Data Structures)" 
                            className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" 
                            required 
                        />
                        <input 
                            type="text" 
                            value={courseCode} 
                            onChange={(e) => setCourseCode(e.target.value)} 
                            placeholder="Course Code / Author (e.g. ENG101)" 
                            className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" 
                            required 
                        />
                        <select 
                            value={department} 
                            onChange={(e) => setDepartment(e.target.value)} 
                            className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
                        >
                            {departmentsList.map((dept) => (
                                <option key={dept} value={dept}>{dept} Department</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4 mb-6">
                        <label className="block text-sm font-semibold text-red-400">Questions & Answers / Book Description List:</label>
                        {qaList.map((qa, index) => (
                            <div key={index} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3 relative">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400 font-bold">Item #{index + 1}</span>
                                    {qaList.length > 1 && (
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveQaRow(index)} 
                                            className="text-xs bg-red-950 text-red-400 hover:bg-red-900 px-2.5 py-1 rounded-lg transition"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <input 
                                    type="text" 
                                    value={qa.question} 
                                    onChange={(e) => handleQaChange(index, 'question', e.target.value)} 
                                    placeholder="Question / Chapter / Topic Title..." 
                                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-sm" 
                                    required 
                                />
                                <textarea 
                                    value={qa.answer} 
                                    onChange={(e) => handleQaChange(index, 'answer', e.target.value)} 
                                    placeholder="Answer / Detailed Notes / Summary..." 
                                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white leading-relaxed text-sm" 
                                    rows="3" 
                                    required 
                                />
                            </div>
                        ))}
                        <button 
                            type="button" 
                            onClick={handleAddQaRow} 
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-red-400 rounded-xl text-xs font-bold transition"
                        >
                            + Add Another Question/Topic
                        </button>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-sm text-slate-400 mb-2">Upload Online Book PDF or Image (Optional):</label>
                        <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700" />
                    </div>

                    <div className="flex gap-4">
                        <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 p-3 rounded-xl font-bold transition">
                            {editingId ? "Update Note / Book" : "Save Note / Book"}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); setCourseTitle(''); setCourseCode(''); setDepartment('English'); setQaList([{ question: '', answer: '' }]); }} className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl font-bold transition">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {/* Department Filters & Search Bar Section */}
                <div className="space-y-4 mb-6">
                    {/* Department Tabs Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        <button 
                            onClick={() => setSelectedDeptFilter('All')} 
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedDeptFilter === 'All' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}
                        >
                            🌐 All Departments
                        </button>
                        {departmentsList.map((dept) => (
                            <button 
                                key={dept} 
                                onClick={() => setSelectedDeptFilter(dept)} 
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedDeptFilter === dept ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}
                            >
                                📚 {dept}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <input 
                        type="text" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        placeholder="🔍 Search online books or notes by title, code, or keywords..." 
                        className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 shadow-lg focus:outline-none focus:border-red-500 transition"
                    />
                </div>

                {/* Notes & Online Books Feed */}
                <div className="space-y-6">
                    {filteredNotes.length > 0 ? (
                        filteredNotes.map((note) => (
                            <div 
                                key={note._id} 
                                className={`p-6 rounded-2xl shadow-lg transition border ${note.isHighlighted ? 'bg-red-950/30 border-red-500 shadow-red-950/50' : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="bg-red-950/80 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-md border border-red-900/50 uppercase tracking-wider">
                                            {note.department || 'English'}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{note.courseTitle}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap justify-end">
                                        <span className="bg-slate-800 text-xs px-3 py-1 rounded-full font-mono text-red-300 border border-slate-700">{note.courseCode}</span>
                                        <button 
                                            onClick={() => toggleHighlight(note)} 
                                            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${note.isHighlighted ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'}`}
                                        >
                                            {note.isHighlighted ? '⭐ Highlighted' : '⭐ Highlight'}
                                        </button>
                                        <button onClick={() => handleEdit(note)} className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition font-medium">Edit</button>
                                        <button onClick={() => handleDelete(note._id)} className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition font-medium">Delete</button>
                                    </div>
                                </div>
                                
                                {note.qaList && Array.isArray(note.qaList) && note.qaList.length > 0 ? (
                                    <div className="space-y-3 mb-4">
                                        {note.qaList.map((item, qIdx) => (
                                            <div key={qIdx} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-sm">
                                                <h4 className="font-bold text-white mb-1">❓ {item.question}</h4>
                                                {item.answer && (
                                                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed mt-2 pl-4 border-l-2 border-red-500/50">
                                                        <strong className="text-red-400 block mb-0.5 text-xs uppercase tracking-wider">Details / Summary:</strong>
                                                        {item.answer}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <h4 className="text-xl font-bold text-white mb-2">❓ {note.question || note.notesContent}</h4>
                                        {note.answer && (
                                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed mb-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-sm">
                                                <strong className="text-red-400 block mb-1">Details:</strong>
                                                {note.answer}
                                            </p>
                                        )}
                                    </>
                                )}
                                
                                {note.attachment && (
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        {/* Online In-App PDF/Image Viewer Button */}
                                        <button 
                                            onClick={() => setViewingPdfUrl(`http://localhost:5000${note.attachment}`)} 
                                            className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg"
                                        >
                                            <span>📖</span> Read Online Book / PDF
                                        </button>

                                        {/* Direct Download Button */}
                                        <a 
                                            href={`http://localhost:5000${note.attachment}`} 
                                            download 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-xs bg-slate-800 border border-slate-700 text-red-400 font-semibold px-4 py-2 rounded-xl hover:bg-slate-700 transition flex items-center gap-1.5"
                                        >
                                            <span>📥</span> Download PDF
                                        </a>
                                    </div>
                                )}

                                <p className="text-slate-500 text-xs">Added on: {new Date(note.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-500 py-6">No online books or notes found for this selection.</p>
                    )}
                </div>
            </div>

            {/* In-App Online PDF/Book Modal Viewer */}
            {viewingPdfUrl && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4 md:p-10">
                    <div className="max-w-5xl w-full mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                                <span>📖</span> Online Book & PDF Reader
                            </h3>
                            <div className="flex items-center gap-3">
                                <a 
                                    href={viewingPdfUrl} 
                                    download 
                                    className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg font-semibold transition"
                                >
                                    📥 Download
                                </a>
                                <button 
                                    onClick={() => setViewingPdfUrl(null)} 
                                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold transition"
                                >
                                    ✕ Close
                                </button>
                            </div>
                        </div>

                        {/* Modal Body (Embedded Viewer) */}
                        <div className="flex-1 bg-slate-950 p-2 overflow-hidden">
                            <iframe 
                                src={viewingPdfUrl} 
                                title="Online Book Viewer" 
                                className="w-full h-full rounded-xl border border-slate-800 bg-white"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Section */}
            <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-center text-slate-400 text-xs">
                <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p>© 2026 <span className="text-red-500 font-semibold">Study Dashboard</span>. All rights reserved.</p>
                    <p className="text-slate-400">Developed by <span className="text-red-400 font-semibold">Nasrin Sultana</span></p>
                </div>
            </footer>
        </div>
    );
};

export default CourseNotes;