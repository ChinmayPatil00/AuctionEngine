import React, { useState, useEffect } from 'react';
import { User, Key, Save, Shield } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import api from '../api/axios';

const SettingsView = () => {
  const { logout } = useAppStore();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [apiKey, setApiKey] = useState('');
  const [isSavedProfile, setIsSavedProfile] = useState(false);
  const [isSavedKey, setIsSavedKey] = useState(false);

  useEffect(() => {
    // Load Gemini Key from localStorage
    const savedKey = localStorage.getItem('geminiKey');
    if (savedKey) setApiKey(savedKey);

    // Fetch user profile from backend
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data) {
          setProfile({ name: response.data.name || '', email: response.data.email || '' });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch('/auth/profile', profile);
      // Update global user store if we have it
      useAppStore.getState().setUser(response.data);
      useAppStore.getState().addNotification('Profile saved', 'success');
      setIsSavedProfile(true);
      setTimeout(() => setIsSavedProfile(false), 2000);
    } catch (error) {
      console.error("Error saving profile:", error);
      useAppStore.getState().addNotification('Failed to save profile', 'error');
    }
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('geminiKey', apiKey);
    setIsSavedKey(true);
    setTimeout(() => setIsSavedKey(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-bg-dark p-8 pb-32">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <h1 className="text-2xl font-bold text-white tracking-wide uppercase">Settings</h1>

        <div className="bg-bg-card border border-border-dark rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6 border-b border-border-dark pb-4">
            <User size={20} className="text-brand-purple" />
            <h2 className="text-lg font-semibold text-white">Profile Settings</h2>
          </div>
          
          <form className="space-y-6" onSubmit={handleSaveProfile}>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Display Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full bg-bg-dark border border-border-dark rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
              <input 
                type="email" 
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="w-full bg-bg-dark border border-border-dark rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-brand-purple hover:bg-brand-purple-hover text-white font-medium rounded-md transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>{isSavedProfile ? 'Saved!' : 'Save Profile'}</span>
            </button>
          </form>
        </div>

        <div className="bg-bg-card border border-border-dark rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6 border-b border-border-dark pb-4">
            <Key size={20} className="text-brand-orange" />
            <h2 className="text-lg font-semibold text-white">API Keys</h2>
          </div>
          
          <form className="space-y-6" onSubmit={handleSaveKey}>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Google Gemini API Key</label>
              <div className="flex space-x-3">
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 bg-bg-dark border border-border-dark rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-brand-orange"
                />
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-medium rounded-md transition-colors flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{isSavedKey ? 'Saved!' : 'Save Key'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center">
                <Shield size={12} className="mr-1" />
                Keys are stored securely in your browser's local storage and only used for your generation requests.
              </p>
            </div>
          </form>
        </div>

        <div className="bg-bg-card border border-border-dark rounded-xl shadow-lg p-8">
          <h2 className="text-lg font-semibold text-white mb-4">Danger Zone</h2>
          <p className="text-sm text-slate-400 mb-6">Log out of your account on this device.</p>
          <button 
            onClick={logout}
            className="px-6 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
