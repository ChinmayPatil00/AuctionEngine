import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [endedAuctions, setEndedAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { api, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const [activeRes, upcomingRes, endedRes] = await Promise.all([
          api.get('/auctions/active'),
          api.get('/auctions/upcoming'),
          api.get('/auctions/ended')
        ]);
        setActiveAuctions(activeRes.data);
        setUpcomingAuctions(upcomingRes.data);
        setEndedAuctions(endedRes.data);
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
    const isEnded = type === 'ended';

    return (
      <div className={`glass-card rounded-2xl overflow-hidden group ${isEnded ? 'opacity-80 grayscale hover:grayscale-0' : ''}`}>
        <div className="relative h-64 overflow-hidden bg-gray-900">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
          <img src={auction.imageUrl} alt={auction.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
          <div className="absolute bottom-4 left-4 z-20 flex gap-2">
            {isLive && <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-bold rounded-full uppercase backdrop-blur-md animate-pulse">Live</span>}
            {isUpcoming && <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-bold rounded-full uppercase backdrop-blur-md">Upcoming</span>}
            {isEnded && <span className="px-3 py-1 bg-pink-500/20 border border-pink-500/50 text-pink-400 text-xs font-bold rounded-full uppercase backdrop-blur-md">Ended</span>}
          </div>
        </div>
        
        <div className="p-6 relative z-20 -mt-4 bg-gradient-to-b from-transparent to-black/80">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{auction.title}</h3>
          <p className="text-gray-400 text-sm mb-6 line-clamp-2">{auction.description}</p>
          
          <div className="flex justify-between items-end border-t border-gray-700/50 pt-6 mt-6">
            <div>
              {isLive && (
                <>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Current Bid</p>
                  <p className="text-2xl font-bold text-glow-blue text-accent">${auction.currentPrice.toLocaleString()}</p>
                </>
              )}
              {isUpcoming && (
                <>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Starts In</p>
                  <p className="text-lg font-bold text-yellow-400">{formatDistanceToNow(new Date(auction.startTime))}</p>
                </>
              )}
              {isEnded && (
                <>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Winning Bid</p>
                  <p className="text-2xl font-bold text-gray-400">${auction.currentPrice.toLocaleString()}</p>
                </>
              )}
            </div>
            
            <Link to={`/auction/${auction._id}`} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isLive ? 'bg-white/10 text-white hover:bg-accent hover:shadow-[0_0_15px_rgba(59,130,246,0.6)]' :
              isUpcoming ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black' :
              'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}>
              →
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in-down pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 tracking-tight">
            Auction Hub
          </h2>
          <p className="text-gray-400 mt-2 text-lg">Bid, schedule, and review rare assets.</p>
        </div>
        {user && (
          <Link to="/create-auction" className="px-8 py-4 bg-accent/20 hover:bg-accent/40 text-accent transition-all rounded-xl font-bold border border-accent/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] uppercase tracking-wider flex items-center gap-2">
            <span>+ Create</span>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-16">
          
          {/* LIVE AUCTIONS */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse"></div>
              <h3 className="text-3xl font-black tracking-tight text-white">Live Marketplace</h3>
            </div>
            {activeAuctions.length === 0 ? (
              <div className="text-center py-16 glass-panel rounded-3xl border-dashed border-white/10">
                <p className="text-gray-500 font-mono">No live auctions right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeAuctions.map(auction => <AuctionCard key={auction._id} auction={auction} type="live" />)}
              </div>
            )}
          </section>

          {/* UPCOMING AUCTIONS */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]"></div>
              <h3 className="text-3xl font-black tracking-tight text-white">Upcoming Auctions</h3>
            </div>
            {upcomingAuctions.length === 0 ? (
              <div className="text-center py-16 glass-panel rounded-3xl border-dashed border-white/10">
                <p className="text-gray-500 font-mono">No upcoming auctions scheduled.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingAuctions.map(auction => <AuctionCard key={auction._id} auction={auction} type="upcoming" />)}
              </div>
            )}
          </section>

          {/* ENDED AUCTIONS */}
          <section>
            <div className="flex items-center gap-4 mb-8 border-t border-white/10 pt-16">
              <div className="w-4 h-4 rounded-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.6)]"></div>
              <h3 className="text-3xl font-black tracking-tight text-pink-400">Auction History</h3>
            </div>
            {endedAuctions.length === 0 ? (
              <div className="text-center py-16 glass-panel rounded-3xl border-dashed border-white/10">
                <p className="text-gray-500 font-mono">No history available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {endedAuctions.map(auction => <AuctionCard key={auction._id} auction={auction} type="ended" />)}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
};

export default Dashboard;
