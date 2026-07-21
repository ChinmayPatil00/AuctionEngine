import { create } from 'zustand';
import api from '../api/axios';

const useAppStore = create((set, get) => ({
  scripts: [],
  activeScriptId: null,
  activeScriptData: { title: '', outline: '', content: '' },
  user: null,
  searchQuery: '',
  notifications: [],
  
  // Actions
  setScripts: (scripts) => set({ scripts }),
  setActiveScriptId: (id) => set({ activeScriptId: id }),
  setActiveScriptData: (data) => set({ activeScriptData: data }),
  updateActiveScriptData: (field, value) => set((state) => ({ 
    activeScriptData: { ...state.activeScriptData, [field]: value }
  })),
  setUser: (user) => set({ user }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  addNotification: (message, type = 'info') => set((state) => ({
    notifications: [{ id: Date.now(), message, type, time: new Date() }, ...state.notifications]
  })),
  clearNotifications: () => set({ notifications: [] }),
  
  updateScriptStatus: (id, newStatus) => set((state) => ({
    scripts: state.scripts.map((script) => 
      script._id === id ? { ...script, status: newStatus } : script
    )
  })),

  saveActiveScript: async () => {
    const { activeScriptId, activeScriptData, scripts, addNotification } = get();
    if (!activeScriptId) return;
    try {
      const response = await api.patch(`/scripts/${activeScriptId}`, activeScriptData);
      set({ scripts: scripts.map(s => s._id === activeScriptId ? response.data : s) });
      addNotification('Script auto-saved securely to cloud.', 'success');
      return true;
    } catch (error) {
      console.error("Manual save failed:", error);
      addNotification('Failed to save script.', 'error');
      return false;
    }
  },

  deleteScript: async (id) => {
    const { scripts, activeScriptId } = get();
    try {
      await api.delete(`/scripts/${id}`);
      set({ 
        scripts: scripts.filter(s => s._id !== id),
        activeScriptId: activeScriptId === id ? null : activeScriptId,
        activeScriptData: activeScriptId === id ? { title: '', outline: '', content: '' } : get().activeScriptData
      });
      return true;
    } catch (error) {
      console.error("Delete failed:", error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}));

export default useAppStore;
