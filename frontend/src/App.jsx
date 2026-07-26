import React, { useContext } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateAuction from './pages/CreateAuction';
import AuctionRoom from './pages/AuctionRoom';
import Profile from './pages/Profile';

function App() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      {/* Floating Glass Navbar */}
      <div className="sticky top-0 z-50 p-4">
        <header className="glass-panel max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center transition-all border-b-2 border-accent">
          <Link to="/" className="flex items-center gap-3 group">
            <h1 className="text-2xl font-black tracking-widest uppercase text-white serif-heading group-hover:text-accent transition-colors">
              Auction Engine
            </h1>
          </Link>
          <div className="flex gap-2 sm:gap-4 items-center flex-wrap justify-center">
            {user ? (
              <>
                <Link to="/profile" className="px-5 py-2 bg-black/40 hover:bg-black/60 transition-colors rounded-sm font-mono flex items-center gap-3 border border-gray-800 cursor-pointer group">
                  <span className="text-gray-400 text-xs uppercase tracking-widest group-hover:text-white transition-colors">The Vault</span>
                  <span className="text-accent font-bold text-lg">${user.walletBalance?.toLocaleString()}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors rounded-xl font-bold text-sm uppercase tracking-wide border border-red-500/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-6 py-2 hover:text-accent transition-colors font-bold text-sm uppercase tracking-wide">
                  Login
                </Link>
                <Link to="/register" className="px-6 py-2 bg-accent hover:bg-accent-hover text-black transition-all rounded-sm font-bold text-sm uppercase tracking-widest">
                  Register
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-auction" element={<CreateAuction />} />
          <Route path="/auction/:id" element={<AuctionRoom />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      {/* Developer Footer for Testing */}
      <footer className="mt-4 border-t border-gray-800 py-4 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center gap-2">
          <p className="text-gray-500 text-xs font-serif">Auction Engine &copy; 2026. All rights reserved.</p>
          <button 
            onClick={async () => {
              try {
                const axios = (await import('axios')).default;
                const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const res = await axios.get(`${url}/auctions/seed`);
                alert(res.data.message);
                window.location.reload();
              } catch (err) {
                alert('Failed to seed database: ' + err.response?.data?.message || err.message);
              }
            }}
            className="text-xs text-gray-700 hover:text-accent transition-colors underline decoration-dotted"
          >
            [Dev Tool] Seed Database with Test Data
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
