import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseNotes from '../components/CourseNotes';
import StudyTimer from '../components/StudyTimer';
import DailySchedule from '../components/DailySchedule';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');

    // Open Library API সার্চের জন্য স্টেট
    const [searchTerm, setSearchTerm] = useState('');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const name = localStorage.getItem('userName');
        
        if (!userId) {
            navigate('/login');
        } else {
            setUserName(name || 'Student');
        }
    }, [navigate]);

    // Open Library API থেকে বই খোঁজার ফাংশন
    const handleSearchClick = async () => {
        if (!searchTerm.trim()) return;
        setLoading(true);
        try {
            // Open Library API ব্যবহার করা হলো যা আরও নিখুঁত রেজাল্ট দেয়
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}&limit=9`);
            const data = await response.json();
            setBooks(data.docs || []);
        } catch (error) {
            console.error("Error fetching books:", error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[90vh] bg-slate-950 p-6 text-white max-w-6xl mx-auto space-y-8">
            {/* Welcome Banner */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-red-500">Welcome back, {userName}! 👋</h1>
                    <p className="text-slate-400 mt-1">Manage your course notes, study timer, and daily schedule all in one place.</p>
                </div>
            </div>

            {/* Timer and Schedule Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <StudyTimer />
                <DailySchedule />
            </div>

            {/* Online Book Search Section (Open Library API Connected) */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
                <h2 className="text-xl font-bold text-red-500">📚 Online Book Search Library</h2>
                
                {/* Search Bar & Button */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search books by title, author, or subject (e.g., Poetry, Physics)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearchClick();
                            }
                        }}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-red-600 text-white placeholder-slate-400"
                    />
                    <button
                        type="button"
                        onClick={handleSearchClick}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition shrink-0"
                    >
                        Search
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">বইয়ের নাম বা লেখকের নাম লিখে Search করুন...</p>

                {/* Loading State */}
                {loading && (
                    <div className="text-center text-slate-400 py-4">বই খোঁজা হচ্ছে...</div>
                )}

                {/* Search Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {!loading && books.length > 0 ? (
                        books.map((book, index) => {
                            const title = book.title || "Unknown Title";
                            const author = book.author_name ? book.author_name.join(', ') : "Unknown Author";
                            // Open Library রিডিং লিঙ্ক তৈরি করা
                            const bookLink = book.key ? `https://openlibrary.org${book.key}` : "#";

                            return (
                                <div key={index} className="bg-slate-950 border border-slate-800 p-5 rounded-xl shadow-md flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-white line-clamp-1">{title}</h3>
                                        <p className="text-sm text-slate-400 mt-1">Author: {author}</p>
                                    </div>
                                    
                                    <div className="mt-5">
                                        <a
                                            href={bookLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block w-full text-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition"
                                        >
                                            Read Online
                                        </a>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        !loading && searchTerm && (
                            <div className="col-span-full text-center py-6 text-slate-500">
                                কোনো বই পাওয়া যায়নি। অন্য নাম দিয়ে চেষ্টা করুন।
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Course Notes Component */}
            <div className="pt-4">
                <CourseNotes />
            </div>
        </div>
    );
};

export default Dashboard;
