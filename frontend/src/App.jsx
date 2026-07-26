import React, { useContext } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateAuction from './pages/CreateAuction';
import AuctionRoom from './pages/AuctionRoom';

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
        <header className="glass-panel max-w-6xl mx-auto rounded-2xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center transition-all">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent flex items-center justify-center group-hover:bg-accent/40 transition-colors">
              <span className="text-accent font-bold">Æ</span>
            </div>
            <h1 className="text-2xl font-bold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Auction Engine
            </h1>
          </Link>
          <div className="flex gap-2 sm:gap-4 items-center flex-wrap justify-center">
            {user ? (
              <>
                <div className="px-5 py-2 bg-black/40 rounded-xl font-mono flex items-center gap-3 border border-white/5 shadow-inner">
                  <span className="text-gray-400 text-xs uppercase tracking-widest">Balance</span>
                  <span className="text-green-400 font-bold text-lg text-glow-green">${user.walletBalance?.toLocaleString()}</span>
                </div>
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
                <Link to="/register" className="px-6 py-2 bg-accent hover:bg-blue-600 transition-all rounded-xl font-bold text-sm uppercase tracking-wide shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  Register
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      <main className="max-w-6xl mx-auto pt-8 px-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-auction" element={<CreateAuction />} />
          <Route path="/auction/:id" element={<AuctionRoom />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
