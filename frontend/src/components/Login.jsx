import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-bg-dark">
      <div className="w-full max-w-md bg-bg-card p-8 rounded-xl shadow-2xl border border-border-dark">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>
        {error && <div className="mb-4 text-red-400 text-sm text-center">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-all outline-none" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-all outline-none" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-medium py-3 rounded-lg mt-6 shadow-lg shadow-brand-orange/20 transition-all">
            Login
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-500 text-center">
          Don't have an account? <Link to="/signup" className="text-brand-orange hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
