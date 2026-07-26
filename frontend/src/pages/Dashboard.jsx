import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { api, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const [activeRes, upcomingRes] = await Promise.all([
          api.get('/auctions/active'),
          api.get('/auctions/upcoming')
        ]);
        setActiveAuctions(activeRes.data);
        setUpcomingAuctions(upcomingRes.data);
      } catch (error) {
        console.error('Failed to fetch auctions');
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, [api]);

  const AuctionCard = ({ auction, type }) => {
    const isLive = type === 'live';
    const isUpcoming = type === 'upcoming';

    return (
      <div className="glass-card group overflow-hidden">
        <div className="relative h-72 overflow-hidden bg-black">
          <img src={auction.imageUrl} alt={auction.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
          <div className="absolute top-4 right-4 z-20">
            {isLive && <span className="px-4 py-1 bg-white text-black text-xs font-bold uppercase tracking-widest">Live Now</span>}
            {isUpcoming && <span className="px-4 py-1 bg-black/80 border border-white/20 text-white text-xs font-bold uppercase tracking-widest backdrop-blur-md">Upcoming</span>}
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2 serif-heading line-clamp-1 group-hover:text-accent transition-colors">{auction.title}</h3>
          <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">{auction.description}</p>
          
          <div className="flex justify-between items-end border-t border-gray-800 pt-6">
            <div>
              {isLive && (
                <>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Current Bid</p>
                  <p className="text-2xl font-bold text-white">${auction.currentPrice.toLocaleString()}</p>
                </>
              )}
              {isUpcoming && (
                <>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Starts In</p>
                  <p className="text-lg font-bold text-accent">{formatDistanceToNow(new Date(auction.startTime))}</p>
                </>
              )}
            </div>
            
            <Link to={`/auction/${auction._id}`} className={`px-6 py-2 border flex items-center justify-center uppercase tracking-widest text-xs font-bold transition-all ${
              isLive ? 'bg-white text-black border-white hover:bg-gray-200' :
              'bg-transparent text-white border-gray-600 hover:border-accent hover:text-accent'
            }`}>
              {isLive ? 'Bid' : 'View'}
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in-down pb-10">
      
      {/* Hero Section */}
      <div className="relative py-24 mb-16 border-b border-gray-800 flex flex-col items-center justify-center text-center bg-black">
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 max-w-4xl mx-auto">
          <p className="text-accent uppercase tracking-[0.3em] text-xs font-bold mb-6">Welcome to</p>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight serif-heading mb-8">
            The Showroom
          </h2>
          <div className="w-24 h-px bg-gray-800 mb-8"></div>
          <p className="text-gray-400 text-base md:text-lg mb-12 leading-relaxed font-light max-w-2xl">
            Discover and bid on the world's most exclusive luxury assets, authenticated and secured on our proprietary immutable ledger.
          </p>
          {user && (
            <Link to="/create-auction" className="px-10 py-4 border border-gray-700 hover:border-white text-white transition-all font-bold uppercase tracking-[0.2em] text-xs bg-transparent hover:bg-white hover:text-black duration-500">
              List an Asset
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="text-accent font-mono tracking-widest uppercase animate-pulse">Loading Catalog...</div>
        </div>
      ) : (
        <div className="space-y-16">
          
          {/* LIVE AUCTIONS */}
          <section>
            <div className="flex items-baseline justify-between mb-8 border-b border-gray-800 pb-3">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white serif-heading">Live Marketplace</h3>
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{activeAuctions.length} Active</span>
            </div>
            {activeAuctions.length === 0 ? (
              <div className="text-center py-24 border border-gray-800">
                <p className="text-gray-500 font-serif italic text-lg">The showroom floor is currently empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeAuctions.map(auction => <AuctionCard key={auction._id} auction={auction} type="live" />)}
              </div>
            )}
          </section>

          {/* UPCOMING AUCTIONS */}
          <section>
            <div className="flex items-baseline justify-between mb-8 border-b border-gray-800 pb-3">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white serif-heading">Upcoming Auctions</h3>
            </div>
            {upcomingAuctions.length === 0 ? (
              <div className="text-center py-24 border border-gray-800">
                <p className="text-gray-500 font-serif italic text-lg">No upcoming auctions scheduled.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingAuctions.map(auction => <AuctionCard key={auction._id} auction={auction} type="upcoming" />)}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
};

export default Dashboard;
