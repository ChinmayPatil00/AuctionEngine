import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', { email, password });
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-bg-dark">
      <div className="w-full max-w-md bg-bg-card p-8 rounded-xl shadow-2xl border border-border-dark">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create an Account</h2>
        {error && <div className="mb-4 text-red-400 text-sm text-center">{error}</div>}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition-all outline-none" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition-all outline-none" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white font-medium py-3 rounded-lg mt-6 shadow-lg shadow-brand-purple/20 transition-all">
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-500 text-center">
          Already have an account? <Link to="/login" className="text-brand-purple hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
