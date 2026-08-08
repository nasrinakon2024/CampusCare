import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // রেন্ডারের লেট রেসপন্স বোঝার জন্য লোডিং স্টেট
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('https://campuscare-hpcs.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                // ব্যাকএন্ড থেকে ডাটা যেভাবে আসুক না কেন (user অবজেক্টসহ বা সরাসরি) সেফলি হ্যান্ডেল করবে
                const userId = data.user?._id || data._id || data.id;
                const userName = data.user?.name || data.name;

                localStorage.setItem('userId', userId);
                localStorage.setItem('userName', userName);
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                
                alert("Login Successful!");
                navigate('/dashboard');
            } else {
                alert(data.error || "Login failed!");
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
            <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-red-500">Login to CampusCare</h2>
                
                <div className="mb-4">
                    <label className="block text-sm text-slate-400 mb-2">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" required />
                </div>

                <div className="mb-6">
                    <label className="block text-sm text-slate-400 mb-2">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" required />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-xl font-bold transition disabled:opacity-50">
                    {loading ? "Logging in..." : "Login"}
                </button>
                
                <p className="text-sm text-center text-slate-400 mt-4">
                    Don't have an account? <Link to="/register" className="text-red-400 hover:underline">Register</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;