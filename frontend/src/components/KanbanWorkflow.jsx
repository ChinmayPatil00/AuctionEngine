import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FileText, MoreVertical, Plus } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import api from '../api/axios';

const COLUMNS = ['Idea Pool', 'Scripting', 'Production', 'Posted'];

const KanbanWorkflow = () => {
  const { scripts, setScripts, updateScriptStatus, searchQuery, setActiveScriptId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch scripts
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

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      // Optimistically update UI
      updateScriptStatus(draggableId, destination.droppableId);

      // Send to backend
      try {
        await api.patch(`/scripts/${draggableId}`, { status: destination.droppableId });
      } catch (error) {
        console.error("Failed to update status", error);
        // Revert on failure (simplified)
        updateScriptStatus(draggableId, source.droppableId);
      }
    }
  };

  const handleCreateNew = async () => {
    try {
      const res = await api.post('/scripts', { title: 'New Script Idea' });
      setScripts([res.data, ...scripts]);
      setActiveScriptId(res.data._id);
      navigate('/scripts');
    } catch (error) {
      console.error("Failed to create script", error);
    }
  };

  const handleEditScript = (id) => {
    setActiveScriptId(id);
    navigate('/scripts');
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center">Loading workflow...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Content Pipeline</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage your video ideas from concept to published.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all font-medium shadow-lg shadow-brand-500/20"
        >
          <Plus size={18} />
          <span>New Script</span>
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-1 space-x-6 overflow-x-auto pb-4">
          {COLUMNS.map((colName) => {
            const colScripts = scripts.filter(s => 
              s.status === colName && 
              s.title.toLowerCase().includes((searchQuery || '').toLowerCase())
            );
            
            return (
              <div key={colName} className="flex flex-col w-80 shrink-0">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-semibold text-slate-300 flex items-center">
                    {colName} 
                    <span className="ml-3 bg-slate-800 text-slate-400 text-xs py-0.5 px-2.5 rounded-full font-medium">
                      {colScripts.length}
                    </span>
                  </h3>
                </div>

                <Droppable droppableId={colName}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 rounded-2xl p-3 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-slate-900/50 border border-transparent'
                      }`}
                    >
                      <div className="space-y-3">
                        {colScripts.map((script, index) => (
                          <Draggable key={script._id} draggableId={script._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => handleEditScript(script._id)}
                                className={`bg-slate-800 rounded-xl p-4 cursor-pointer group hover:ring-1 hover:ring-brand-500 transition-all ${
                                  snapshot.isDragging ? 'shadow-xl shadow-black/50 ring-2 ring-brand-500 opacity-90' : 'shadow-sm'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="bg-slate-700/50 p-2 rounded-lg">
                                    <FileText size={16} className="text-brand-400" />
                                  </div>
                                  <button className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded-md">
                                    <MoreVertical size={16} />
                                  </button>
                                </div>
                                <h4 className="font-medium text-slate-200 line-clamp-2 leading-tight">
                                  {script.title || 'Untitled'}
                                </h4>
                                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                                  <span>{new Date(script.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanWorkflow;
