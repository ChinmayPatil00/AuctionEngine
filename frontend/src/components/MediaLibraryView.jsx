import React, { useState, useEffect, useRef } from 'react';
import { Upload, Folder, Image as ImageIcon, Video, Search, MoreVertical, Trash2 } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import api from '../api/axios';

const folders = [
  { id: 'All', name: 'All Media' },
  { id: 'image', name: 'Images' },
  { id: 'video', name: 'Videos' },
];

const MediaLibraryView = () => {
  const { addNotification } = useAppStore();
  const [mediaList, setMediaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('All');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await api.get('/media');
      setMediaList(response.data);
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await api.post('/media', formData, {
          headers: { 'Content-Type': undefined } // Forces browser to set correct boundary
        });
        setMediaList([response.data, ...mediaList]);
        addNotification('Media uploaded successfully', 'success');
      } catch (error) {
        console.error("Error uploading file:", error);
        addNotification('Failed to upload media', 'error');
      } finally {
        e.target.value = null; // Reset input so same file can be uploaded again
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/media/${id}`);
      setMediaList(mediaList.filter(m => m._id !== id));
      addNotification('Media deleted', 'success');
    } catch (error) {
      console.error("Error deleting media:", error);
      addNotification('Failed to delete media', 'error');
    }
  };

  const filteredMedia = mediaList.filter(media => {
    const matchesSearch = media.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = activeFolder === 'All' || media.type === activeFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="flex-1 flex overflow-hidden bg-bg-dark">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="image/*,video/*"
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto pb-32">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase">Media Library</h1>
          <div className="flex space-x-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search media..."
                className="bg-bg-card border border-border-dark rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-slate-500 text-slate-200 w-64"
              />
            </div>
            <button 
              onClick={() => fileInputRef.current.click()}
              className="flex items-center space-x-2 text-sm font-medium text-white bg-brand-purple hover:bg-brand-purple-hover px-4 py-2 rounded-md transition-colors shadow-sm shadow-brand-purple/20"
            >
              <Upload size={16} />
              <span>Upload Files</span>
            </button>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Folders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {folders.map(folder => (
            <div 
              key={folder.id} 
              onClick={() => setActiveFolder(folder.id)}
              className={`border p-4 rounded-lg flex items-center space-x-3 cursor-pointer transition-colors ${
                activeFolder === folder.id ? 'bg-slate-800 border-brand-purple' : 'bg-bg-card border-border-dark hover:border-brand-purple'
              }`}
            >
              <div className="p-2 bg-slate-900 rounded-md text-brand-purple">
                <Folder size={20} />
              </div>
              <div>
                <h3 className="font-medium text-white text-sm">{folder.name}</h3>
                <p className="text-xs text-slate-500">
                  {folder.id === 'All' ? mediaList.length : mediaList.filter(m => m.type === folder.id).length} files
                </p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Recent Media</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredMedia.map(media => (
            <div key={media._id} className="bg-bg-card border border-border-dark rounded-xl overflow-hidden group">
              <div className="aspect-video bg-slate-800 relative overflow-hidden">
                {media.type === 'video' ? (
                  <video src={`http://localhost:5000${media.url}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <img src={`http://localhost:5000${media.url}`} alt={media.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                )}
                <div className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur rounded text-white">
                  {media.type === 'image' ? <ImageIcon size={14} /> : <Video size={14} />}
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-white truncate pr-2">{media.name}</p>
                  <button onClick={() => handleDelete(media._id)} className="text-slate-500 hover:text-red-400 shrink-0"><Trash2 size={14} /></button>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>{media.size}</span>
                  <span>{new Date(media.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default MediaLibraryView;
