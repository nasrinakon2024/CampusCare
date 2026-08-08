import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName');

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        alert("Logged out successfully!");
        navigate('/login');
    };

    return (
        <nav className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center text-white sticky top-0 z-50 shadow-md">
            <Link to="/dashboard" className="text-2xl font-bold text-red-500 tracking-wider">CampusCare</Link>
            
            <div className="flex items-center gap-4">
                {userName && (
                    <span className="text-sm font-medium text-slate-300">
                        👋 Hi, <span className="text-red-400">{userName}</span>
                    </span>
                )}
                
                {userName ? (
                    <button 
                        onClick={handleLogout} 
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm font-bold transition shadow-lg">
                        Logout
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <Link to="/login" className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition">Login</Link>
                        <Link to="/register" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm font-bold transition">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;