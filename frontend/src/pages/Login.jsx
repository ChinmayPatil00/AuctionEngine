import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-fade-in-down">
      <div className="w-full max-w-md p-8 glass-panel rounded-3xl">
        <h2 className="text-3xl font-black mb-6 text-center text-white tracking-wide">Welcome Back</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full py-3 bg-accent hover:bg-blue-600 transition-colors rounded-lg font-medium shadow-lg shadow-blue-500/20 text-white mt-4">
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400">
          Don't have an account? <Link to="/register" className="text-accent hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
