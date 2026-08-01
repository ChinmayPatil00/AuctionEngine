import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSeedNotice, setShowSeedNotice] = useState(true);
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

  const SkeletonAuctionCard = () => (
    <div className="glass-card animate-pulse border border-gray-800 bg-black/40">
      <div className="h-72 bg-gray-900"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-800 rounded w-3/4 mb-4"></div>
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6"></div>
        </div>
        <div className="flex justify-between items-end border-t border-gray-800 pt-6">
          <div className="w-1/2">
            <div className="h-3 bg-gray-800 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-800 rounded w-3/4"></div>
          </div>
          <div className="h-10 w-24 bg-gray-800 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in-down pb-4">
      
      {showSeedNotice && (
        <div className="bg-accent/10 border border-accent/20 text-accent px-4 py-3 rounded relative max-w-4xl mx-auto mt-4 mb-6 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4" role="alert">
          <span className="block sm:inline font-mono text-sm">
            <strong>Welcome!</strong> To populate the marketplace with live auctions and high-quality images, please scroll to the very bottom of the page and click the <strong className="text-white">"[Dev Tool] Seed Database with Test Data"</strong> link in the footer.
          </span>
          <button onClick={() => setShowSeedNotice(false)} className="text-accent hover:text-white font-bold text-xl leading-none">
            &times;
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative py-12 md:py-16 mb-8 md:mb-12 border-b border-gray-800 flex flex-col items-center justify-center text-center bg-black">
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
        <div className="space-y-10 md:space-y-12">
          <section>
            <div className="flex items-baseline justify-between mb-8 border-b border-gray-800 pb-3">
              <div className="h-8 bg-gray-800 rounded w-48 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <SkeletonAuctionCard />
              <SkeletonAuctionCard />
              <SkeletonAuctionCard />
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-10 md:space-y-12">
          
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
