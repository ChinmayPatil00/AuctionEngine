import React, { useState } from 'react';
import ScriptEditor from './ScriptEditor';
import AIAssistant from './AIAssistant';
import MiniKanban from './MiniKanban';
import useAppStore from '../store/useAppStore';
import api from '../api/axios';
import { Loader2, X, Trash2 } from 'lucide-react';

const ScriptEditorDashboard = () => {
  const { activeScriptId, scripts, setScripts, saveActiveScript, deleteScript } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleManualSave = async () => {
    setIsSaving(true);
    await saveActiveScript();
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this script?")) {
      setIsDeleting(true);
      await deleteScript(activeScriptId);
      setIsDeleting(false);
    }
  };

  const handleShareClick = () => {
    const url = `${window.location.origin}/script/${activeScriptId || 'demo'}`;
    navigator.clipboard.writeText(url);
    setIsShareModalOpen(true);
  };

  const handleEditClick = () => {
    const active = scripts.find(s => s._id === activeScriptId);
    setNewTitle(active ? active.title : 'Untitled Script');
    setIsRenameModalOpen(true);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (activeScriptId && newTitle) {
      try {
        const response = await api.patch(`/scripts/${activeScriptId}`, { title: newTitle });
        setScripts(scripts.map(s => s._id === activeScriptId ? response.data : s));
      } catch (error) {
        console.error("Rename failed:", error);
      }
    }
    setIsRenameModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-hidden bg-bg-dark flex flex-col relative">
      
      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="absolute top-16 right-8 bg-brand-purple text-white p-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <span>Link copied to clipboard!</span>
          <button onClick={() => setIsShareModalOpen(false)}><X size={16}/></button>
        </div>
      )}

      {/* Rename Modal */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-bg-card border border-border-dark w-96 rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Rename Script</h2>
              <button onClick={() => setIsRenameModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-bg-dark border border-border-dark rounded p-2 text-white" />
              </div>
              <button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white py-2 rounded-md font-medium mt-4">
                Save Title
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-8 py-4 shrink-0">
         <h1 className="text-2xl font-bold text-white tracking-wide uppercase">SCRIPT DASHBOARD</h1>
         <div className="flex items-center space-x-3">
           <button onClick={handleShareClick} className="px-4 py-2 text-sm font-medium text-slate-300 bg-bg-card border border-border-dark rounded-md hover:bg-bg-card-hover transition-colors">
             Share
           </button>
           <button onClick={handleEditClick} className="px-4 py-2 text-sm font-medium text-slate-300 bg-bg-card border border-border-dark rounded-md hover:bg-bg-card-hover transition-colors">
             Rename
           </button>
           <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center justify-center w-32 py-2 text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 rounded-md transition-colors"
           >
             {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <span className="flex items-center space-x-2"><Trash2 size={16} /><span>Delete</span></span>}
           </button>
           <button 
              onClick={handleManualSave}
              disabled={isSaving}
              className="flex items-center justify-center w-32 py-2 text-sm font-medium text-white bg-brand-orange hover:bg-brand-orange-hover rounded-md transition-colors shadow-lg shadow-brand-orange/20"
           >
             {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Script"}
           </button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden px-8 pb-8 space-x-6">
        {/* Left Column: Script Editor */}
        <div className="flex-1 bg-bg-card border border-border-dark rounded-xl overflow-hidden flex flex-col">
          <ScriptEditor />
        </div>
        
        {/* Right Column: Widgets */}
        <div className="w-96 shrink-0 flex flex-col space-y-6 overflow-y-auto">
          {/* AI Assistant Widget */}
          <div className="bg-bg-card border border-border-dark rounded-xl flex-shrink-0 flex flex-col h-[50%]">
            <AIAssistant />
          </div>
          
          {/* Mini Kanban Widget */}
          <div className="bg-bg-card border border-border-dark rounded-xl flex-shrink-0 flex flex-col h-[45%]">
            <MiniKanban />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptEditorDashboard;
