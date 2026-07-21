import React, { useState, useEffect } from 'react';
import { Calendar, Video, Play, FileText, X } from 'lucide-react';
import api from '../api/axios';

const ScheduleView = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'YouTube', status: 'Scripting' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setScheduleData(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    
    try {
      const response = await api.post('/events', newEvent);
      setScheduleData([...scheduleData, response.data]);
      setIsModalOpen(false);
      setNewEvent({ title: '', date: '', type: 'YouTube', status: 'Scripting' });
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'YouTube': return <Play size={16} />;
      case 'Shorts': return <Video size={16} />;
      case 'TikTok': return <Video size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-bg-dark p-8 pb-32">
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-bg-card border border-border-dark w-96 rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add Schedule Event</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title</label>
                <input type="text" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-bg-dark border border-border-dark rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Date (1-31)</label>
                <input type="number" min="1" max="31" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-bg-dark border border-border-dark rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Platform</label>
                <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className="w-full bg-bg-dark border border-border-dark rounded p-2 text-white">
                  <option value="YouTube">YouTube</option>
                  <option value="Shorts">Shorts</option>
                  <option value="TikTok">TikTok</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white py-2 rounded-md font-medium mt-4">
                Save Event
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase">Content Calendar</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 text-sm font-medium text-white bg-brand-orange hover:bg-brand-orange-hover px-4 py-2 rounded-md transition-colors shadow-sm shadow-brand-orange/20"
          >
            <Calendar size={16} />
            <span>Add Event</span>
          </button>
        </div>

        <div className="bg-bg-card border border-border-dark rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-border-dark border-b border-border-dark">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="bg-bg-card p-4 text-center text-sm font-semibold text-slate-400">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-border-dark">
            {(() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = today.getMonth();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const firstDay = new Date(year, month, 1).getDay();
              // Adjust for Monday start: Sunday(0)->6, Mon(1)->0
              const startOffset = (firstDay + 6) % 7; 
              
              const totalCells = Math.ceil((daysInMonth + startOffset) / 7) * 7;
              
              return Array.from({ length: totalCells }).map((_, i) => {
                const date = i - startOffset + 1; 
                const isCurrentMonth = date > 0 && date <= daysInMonth;
                const event = scheduleData.find(e => parseInt(e.date) === date);
                
                return (
                  <div key={i} className={`bg-bg-card h-32 p-2 ${isCurrentMonth ? 'text-slate-300' : 'text-slate-700 bg-slate-900/40'}`}>
                    <div className="font-semibold text-sm mb-2">{isCurrentMonth ? date : ''}</div>
                    
                    {isCurrentMonth && event && (
                      <div className="bg-slate-800 border border-slate-700 rounded p-2 text-xs cursor-pointer hover:border-brand-orange transition-colors">
                        <div className="flex items-center space-x-1 text-brand-orange mb-1">
                          {getIcon(event.type)}
                          <span className="font-bold">{event.type}</span>
                        </div>
                        <p className="font-medium text-white line-clamp-1">{event.title}</p>
                        <p className="text-slate-500 mt-1 text-[10px]">{event.status}</p>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
