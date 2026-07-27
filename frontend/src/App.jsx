import React, { useContext, lazy, Suspense } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateAuction = lazy(() => import('./pages/CreateAuction'));
const AuctionRoom = lazy(() => import('./pages/AuctionRoom'));
const Profile = lazy(() => import('./pages/Profile'));

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
        <Suspense fallback={
          <div className="flex justify-center items-center h-screen">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-accent tracking-[0.3em] uppercase text-xs font-bold">Authenticating Connection...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-auction" element={<CreateAuction />} />
            <Route path="/auction/:id" element={<AuctionRoom />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Suspense>
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
