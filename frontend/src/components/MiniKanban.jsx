import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import api from '../api/axios';

const columns = [
  { id: 'Idea Pool', title: 'Idea Pool', color: 'text-slate-400', border: 'border-slate-700' },
  { id: 'Scripting', title: 'Scripting', color: 'text-brand-orange', border: 'border-brand-orange/50' },
  { id: 'Production', title: 'Production', color: 'text-brand-purple', border: 'border-brand-purple/50' },
  { id: 'Posted', title: 'Posted', color: 'text-green-500', border: 'border-green-500/50' }
];

const MiniKanban = () => {
  const { scripts, setScripts, setActiveScriptId, searchQuery } = useAppStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const response = await api.get('/scripts');
        setScripts(response.data);
      } catch (error) {
        console.error("Failed to fetch scripts", error);
      } finally {
        setLoading(false);
      }
    };
    fetchScripts();
  }, [setScripts]);

  if (loading) {
    return <div className="h-full flex items-center justify-center text-xs text-slate-500">Loading Kanban...</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border-dark">
        <h3 className="font-semibold text-white text-sm">Content Kanban Workflow</h3>
        <button className="text-slate-500 hover:text-white"><MoreHorizontal size={16} /></button>
      </div>
      
      <div className="flex-1 overflow-x-auto p-3">
        <div className="flex space-x-2 h-full">
          {columns.map(col => {
            const colScripts = scripts.filter(s => 
              s.status === col.id && 
              s.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return (
              <div key={col.id} className="flex flex-col w-24 shrink-0">
                <h4 className={`text-[10px] uppercase font-bold mb-2 ${col.color}`}>
                  {col.title} ({colScripts.length})
                </h4>
                <div className={`flex-1 rounded-md p-1.5 space-y-2 border-t-2 ${col.border} bg-bg-dark overflow-y-auto`}>
                  {colScripts.map(card => (
                    <div 
                      key={card._id} 
                      onClick={() => setActiveScriptId(card._id)}
                      className="bg-slate-800 rounded p-1.5 shadow-sm border border-slate-700 cursor-pointer hover:border-brand-orange transition-colors"
                    >
                      <p className="text-[10px] text-slate-300 leading-tight line-clamp-3 font-medium">
                        {card.title}
                      </p>
                      <p className="text-[8px] text-slate-500 mt-1">
                        {new Date(card.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3 border-t border-border-dark flex items-center justify-between bg-bg-dark">
        <span className="text-xs font-semibold text-slate-300">Recent Media</span>
        <button 
          onClick={() => navigate('/media')}
          className="text-xs font-medium text-white bg-slate-800 px-3 py-1.5 rounded hover:bg-slate-700 transition-colors"
        >
          Media Library Quick Access
        </button>
      </div>
    </div>
  );
};

export default MiniKanban;
