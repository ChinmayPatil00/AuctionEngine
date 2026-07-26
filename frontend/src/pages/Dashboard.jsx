import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { api, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await api.get('/auctions/active');
        setAuctions(res.data);
      } catch (error) {
        console.error('Failed to fetch auctions');
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, [api]);

  return (
    <div className="animate-fade-in-down">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 tracking-tight">
            Live Marketplace
          </h2>
          <p className="text-gray-400 mt-2 text-lg">Bid on rare, ultra-premium assets in real-time.</p>
        </div>
        {user && (
          <Link to="/create-auction" className="px-8 py-4 bg-accent/20 hover:bg-accent/40 text-accent transition-all rounded-xl font-bold border border-accent/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] uppercase tracking-wider">
            + Create Auction
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-32 glass-panel rounded-3xl">
          <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700">
            <span className="text-4xl">🏛️</span>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-white">The showroom is empty.</h3>
          <p className="text-gray-400">Be the first to list a premium asset in the marketplace!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auction) => (
            <div key={auction._id} className="glass-card rounded-2xl overflow-hidden group">
              <div className="relative h-64 overflow-hidden bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <img src={auction.imageUrl} alt={auction.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-bold rounded-full uppercase backdrop-blur-md">Live</span>
                </div>
              </div>
              
              <div className="p-6 relative z-20 -mt-4 bg-gradient-to-b from-transparent to-black/50">
                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1">{auction.title}</h3>
                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{auction.description}</p>
                
                <div className="flex justify-between items-end border-t border-gray-700/50 pt-6 mt-6">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Current Bid</p>
                    <p className="text-3xl font-bold text-glow-blue text-accent">${auction.currentPrice.toLocaleString()}</p>
                  </div>
                  <Link to={`/auction/${auction._id}`} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white text-gray-400 transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                    →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
