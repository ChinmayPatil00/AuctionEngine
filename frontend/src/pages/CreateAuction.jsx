import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateAuction = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('5');
  const [error, setError] = useState('');
  
  const { api, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create an auction');
      return;
    }

    try {
      const res = await api.post('/auctions', {
        title,
        description,
        imageUrl: imageUrl || undefined,
        startingPrice: Number(startingPrice),
        durationMinutes: Number(durationMinutes)
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      navigate(`/`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create auction');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 glass-panel rounded-2xl shadow-xl animate-fade-in-down">
      <h2 className="text-3xl font-bold mb-6 text-white tracking-wide">List New Item</h2>
      
      {error && <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-6">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Item Title</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Rare Vintage Rolex Daytona"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
          <textarea 
            className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white h-24 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the condition, history, and details..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Image URL (Optional)</label>
          <input 
            type="url" 
            className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Starting Price ($)</label>
            <input 
              type="number" 
              min="1"
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white font-mono"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Auction Duration</label>
            <select 
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            >
              <option className="bg-gray-900 text-white" value="1">1 Minute (Testing)</option>
              <option className="bg-gray-900 text-white" value="5">5 Minutes</option>
              <option className="bg-gray-900 text-white" value="15">15 Minutes</option>
              <option className="bg-gray-900 text-white" value="60">1 Hour</option>
            </select>
          </div>
        </div>

        <button type="submit" className="w-full py-3 bg-accent hover:bg-blue-600 transition-colors rounded-lg font-medium shadow-lg shadow-blue-500/20 text-white mt-8">
          Start Live Auction
        </button>
      </form>
    </div>
  );
};

export default CreateAuction;
