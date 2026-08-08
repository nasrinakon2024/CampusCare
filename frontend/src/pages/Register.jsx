import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // লোডিং স্টেট যুক্ত করা হলো
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('https://campuscare-hpcs.onrender.com/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                alert("Registration Successful! Please login.");
                navigate('/login');
            } else {
                alert(data.error || data.message || "Registration failed!");
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Server connection failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] text-white">
            <form onSubmit={handleRegister} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-red-500">Register for CampusCare</h2>
                
                <div className="mb-4">
                    <label className="block text-sm text-slate-400 mb-2">Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500" 
                        required 
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm text-slate-400 mb-2">Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500" 
                        required 
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm text-slate-400 mb-2">Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500" 
                        required 
                    />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-xl font-bold transition disabled:opacity-50">
                    {loading ? "Registering..." : "Register"}
                </button>
                
                <p className="text-sm text-center text-slate-400 mt-4">
                    Already have an account? <Link to="/login" className="text-red-400 hover:underline">Login</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;