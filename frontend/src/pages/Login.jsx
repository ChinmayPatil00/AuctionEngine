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
    <div className="flex flex-col md:flex-row min-h-[60vh] md:min-h-[70vh] animate-fade-in-down border border-gray-800 rounded-lg overflow-hidden bg-surface mt-2 md:mt-4 shadow-2xl">
      
      {/* Left Side: Project Showcase / Value Proposition */}
      <div className="w-full md:w-1/2 relative bg-black hidden md:flex flex-col justify-between p-12 overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1578925518470-4def7aa53bc2?q=80&w=1000&auto=format&fit=crop" alt="Luxury Assets" className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-1000 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black z-10 pointer-events-none"></div>
        </div>
        
        <div className="relative z-20">
          <h2 className="text-4xl font-black text-white tracking-tight serif-heading mb-4">Auction Engine</h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm mb-12">
            The premier platform for discovering, scheduling, and bidding on the world's most exclusive luxury assets.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-10 h-10 border border-accent flex items-center justify-center shrink-0">
                <span className="text-accent text-xl">⚡</span>
              </div>
              <div>
                <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-1">Zero-Latency Bidding</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Powered by WebSockets, our live auction rooms synchronize bids across the globe in milliseconds.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-10 h-10 border border-accent flex items-center justify-center shrink-0">
                <span className="text-accent text-xl">🛡️</span>
              </div>
              <div>
                <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-1">Immutable Ledger</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Every transaction, deposit, and bid is permanently recorded in your personal Vault for maximum transparency.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-10 h-10 border border-accent flex items-center justify-center shrink-0">
                <span className="text-accent text-xl">⏳</span>
              </div>
              <div>
                <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-1">Dynamic Scheduling</h3>
                <p className="text-gray-500 text-sm leading-relaxed">List items instantly or schedule them for a future date, building hype in the Upcoming Showcase.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 text-xs text-gray-600 font-mono tracking-widest uppercase">
          Sys_Ver: 2.4.0 // Secure Connection Est.
        </div>
      </div>

      {/* Right Side: Authentication Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-surface">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-black mb-2 text-white tracking-wide serif-heading">Welcome Back</h2>
          <p className="text-gray-400 mb-8 font-mono text-sm">Please authenticate to enter the showroom.</p>
          
          {error && <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 mb-6 font-mono text-sm">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-black border border-gray-700 focus:outline-none focus:border-accent text-white transition-colors rounded-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 bg-black border border-gray-700 focus:outline-none focus:border-accent text-white transition-colors rounded-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="w-full py-4 bg-white hover:bg-gray-200 transition-colors font-bold text-black uppercase tracking-widest text-sm mt-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300">
              Authenticate
            </button>
          </form>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account? <Link to="/register" className="text-white hover:text-accent font-bold transition-colors">Register Here</Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
