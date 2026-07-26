import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateAuction = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('5');
  const [delayMinutes, setDelayMinutes] = useState('0');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { api, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create an auction');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auctions', {
        title,
        description,
        imageUrl: imageUrl || undefined,
        startingPrice: Number(startingPrice),
        durationMinutes: Number(durationMinutes),
        delayMinutes: Number(delayMinutes)
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      navigate(`/`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create auction');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 bg-surface border border-gray-800 shadow-2xl animate-fade-in-down">
      <h2 className="text-3xl font-black mb-6 text-white tracking-wide serif-heading">List New Asset</h2>
      
      {error && <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 mb-6 font-mono text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Item Title</label>
          <input 
            type="text" 
            className="w-full px-4 py-3 bg-black border border-gray-700 focus:outline-none focus:border-white text-white transition-colors rounded-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Rare Vintage Rolex Daytona"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
          <textarea 
            className="w-full px-4 py-3 bg-black border border-gray-700 focus:outline-none focus:border-white text-white h-32 resize-none transition-colors rounded-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the condition, history, and details..."
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Image URL (Optional)</label>
          <input 
            type="url" 
            className="w-full px-4 py-3 bg-black border border-gray-700 focus:outline-none focus:border-white text-white transition-colors rounded-sm"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Starting Price ($)</label>
            <input 
              type="number" 
              min="1"
              className="w-full px-4 py-3 bg-black border border-gray-700 focus:outline-none focus:border-white text-white font-mono transition-colors rounded-sm"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Start Time</label>
            <select 
              className="w-full px-4 py-3 bg-black border border-gray-700 focus:outline-none focus:border-white text-white transition-colors rounded-sm"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(e.target.value)}
            >
              <option className="bg-gray-900 text-white" value="0">Immediately</option>
              <option className="bg-gray-900 text-white" value="5">In 5 Minutes</option>
              <option className="bg-gray-900 text-white" value="60">In 1 Hour</option>
              <option className="bg-gray-900 text-white" value="1440">In 24 Hours</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Duration</label>
            <select 
              className="w-full px-4 py-3 bg-black border border-gray-700 focus:outline-none focus:border-white text-white transition-colors rounded-sm"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            >
              <option className="bg-gray-900 text-white" value="1">1 Min (Test)</option>
              <option className="bg-gray-900 text-white" value="5">5 Mins</option>
              <option className="bg-gray-900 text-white" value="15">15 Mins</option>
              <option className="bg-gray-900 text-white" value="60">1 Hour</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-4 bg-white hover:bg-gray-200 text-black transition-colors font-bold uppercase tracking-widest text-sm mt-8 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:-translate-y-0.5 duration-300"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Initiating...
            </>
          ) : 'Submit Asset for Listing'}
        </button>
      </form>
    </div>
  );
};

export default CreateAuction;
