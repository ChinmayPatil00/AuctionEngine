import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import api from '../api/axios';
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  Kanban, 
  Image as ImageIcon, 
  Calendar, 
  BarChart2, 
  Settings,
  Search,
  Bell,
  User,
  LogOut,
  CheckCircle,
  X,
} from 'lucide-react';

const Dashboard = () => {
  const { user, setUser, logout, searchQuery, setSearchQuery, notifications, clearNotifications } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const navItems = [
    { name: 'My Scripts', icon: <FileText size={18} />, path: '/scripts' },
    { name: 'Kanban Board', icon: <Kanban size={18} />, path: '/kanban' },
    { name: 'Media Library', icon: <ImageIcon size={18} />, path: '/media' },
    { name: 'Schedule', icon: <Calendar size={18} />, path: '/schedule' },
    { name: 'Analytics', icon: <BarChart2 size={18} />, path: '/analytics' },
    { name: 'Settings', icon: <Settings size={18} />, path: '/settings' },
  ];

  // Fetch user if missing
  useEffect(() => {
    if (!user) {
      const fetchProfile = async () => {
        try {
          const response = await api.get('/auth/me');
          if (response.data) setUser(response.data);
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      };
      fetchProfile();
    }
  }, [user, setUser]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = user?.name || "Creator";

  return (
    <div className="flex h-screen bg-bg-dark text-slate-300 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-bg-dark flex flex-col border-r border-border-dark shrink-0">
        <div className="h-16 flex items-center px-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-orange to-brand-purple"></div>
            <span className="font-bold text-white tracking-wider text-sm">CREATOR.HUB</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive 
                    ? 'bg-brand-orange text-white' 
                    : 'text-slate-400 hover:bg-bg-card hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-dark">
          <div 
            className="flex items-center space-x-3 px-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/settings')}
          >
            <div className="w-8 h-8 rounded-full bg-brand-purple overflow-hidden flex items-center justify-center text-white font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-white truncate w-32">{userName}</span>
              <span className="text-xs text-slate-500">Pro Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-8 bg-bg-dark shrink-0 z-40">
          <div className="w-96">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across your workspace..."
                className="w-full bg-bg-card border border-border-dark rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-slate-500 text-slate-200"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <button onClick={() => navigate('/scripts')} className="p-2 hover:text-white transition-colors" title="My Scripts">
              <FileText size={20} />
            </button>
            
            {/* Notification Dropdown */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                className={`p-2 hover:text-white transition-colors relative ${isNotificationsOpen ? 'text-white' : ''}`}
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand-orange rounded-full"></span>
              </button>
              
              {isNotificationsOpen && (
                <div className="absolute top-12 right-0 w-80 bg-bg-card border border-border-dark rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-border-dark flex justify-between items-center">
                    <h3 className="text-white font-semibold">Notifications</h3>
                    {notifications.length > 0 && (
                      <button onClick={clearNotifications} className="text-xs text-brand-orange hover:text-brand-orange-hover">Mark all as read</button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">
                        You're all caught up!
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-4 border-b border-border-dark hover:bg-bg-card-hover transition-colors flex space-x-3 cursor-pointer">
                          <div className={`mt-1 ${notif.type === 'error' ? 'text-red-400' : notif.type === 'success' ? 'text-green-400' : 'text-brand-orange'}`}>
                            {notif.type === 'error' ? <X size={16} /> : <CheckCircle size={16} />}
                          </div>
                          <div>
                            <p className="text-sm text-slate-200">{notif.message}</p>
                            <p className="text-xs text-slate-500 mt-1">Just now</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 text-center border-t border-border-dark bg-bg-dark">
                      <button className="text-xs text-slate-400 hover:text-white">View all history</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative ml-2" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white font-bold text-sm focus:outline-none ring-2 ring-transparent focus:ring-brand-orange transition-all"
              >
                {userName.charAt(0).toUpperCase()}
              </button>

              {isProfileOpen && (
                <div className="absolute top-12 right-0 w-56 bg-bg-card border border-border-dark rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-border-dark">
                    <p className="text-white font-medium truncate">{userName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || 'creator@example.com'}</p>
                  </div>
                  <div className="py-2">
                    <button 
                      onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-bg-card-hover hover:text-white flex items-center space-x-2"
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    <button 
                      onClick={() => { setIsProfileOpen(false); logout(); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-bg-card-hover hover:text-red-300 flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
