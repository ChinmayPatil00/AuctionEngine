import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';

// --- Sound Effects ---
const playBidSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/3104/3104-preview.mp3');
  audio.volume = 0.4;
  audio.play().catch(e => console.log('Audio play blocked by browser:', e));
};

const playSniperSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
  audio.volume = 0.6;
  audio.play().catch(e => console.log('Audio play blocked by browser:', e));
};

const playErrorSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
  audio.volume = 0.3;
  audio.play().catch(e => console.log('Audio play blocked by browser:', e));
};

const AuctionRoom = () => {
  const { id } = useParams();
  const { api, user, updateBalance } = useContext(AuthContext); 
  
  const [auction, setAuction] = useState(null);
  const [socket, setSocket] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  // 1. Fetch initial auction data
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await api.get(`/auctions/${id}`);
        setAuction(res.data);
        setBidAmount(res.data.currentPrice + 1); // Suggest next bid
      } catch (err) {
        setError('Failed to load auction.');
      }
    };
    fetchAuction();
  }, [id, api]);

  // 2. Setup Socket.io
  useEffect(() => {
    // Smart fallback: If SOCKET_URL is missing, infer it from API_URL
    let socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      socketUrl = apiUrl.replace('/api', '');
    }
    // Pass JWT token for secure backend authentication
    const newSocket = io(socketUrl, {
      auth: {
        token: user?.token || localStorage.getItem('token')
      }
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join_auction', id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('bid_update', (data) => {
      setAuction((prev) => ({
        ...prev,
        currentPrice: data.currentPrice,
        highestBidder: { username: data.highestBidder },
        endTime: data.newEndTime || prev.endTime,
        bidHistory: [data.newBidRecord, ...(prev.bidHistory || [])]
      }));
      setSuccess(data.message);
      
      // Trigger Sound Effects
      if (data.message.includes('Anti-Sniper')) {
        playSniperSound();
      } else {
        playBidSound();
      }

      setTimeout(() => setSuccess(''), 3000);
      setError('');
    });

    newSocket.on('bid_error', (data) => {
      playErrorSound();
      setError(data.message);
      setTimeout(() => setError(''), 3000);
    });

    newSocket.on('wallet_update', (data) => {
      if (updateBalance) {
        updateBalance(data.newBalance);
      }
    });

    newSocket.on('auction_ended', (data) => {
      setAuction(prev => ({
        ...prev,
        status: 'ended',
        currentPrice: data.winningBid
      }));
      setSuccess('Auction Concluded!');
    });

    return () => newSocket.close();
  }, [id]);

  const handleBid = (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to bid.');
      return;
    }
    
    if (Number(bidAmount) <= auction.currentPrice) {
      setError(`Bid must be greater than $${auction.currentPrice}`);
      return;
    }

    // Send bid via WebSocket
    socket.emit('place_bid', {
      auctionId: id,
      userId: user._id,
      bidAmount: Number(bidAmount)
    });
  };

  if (!auction) return <div className="text-center py-20 text-white">Loading Room...</div>;

  const isEnded = new Date(auction.endTime) < new Date() || auction.status === 'ended';

  return (
    <>
    {!isConnected && (
      <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-auto">
        <div className="w-24 h-24 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-8"></div>
        <h2 className="text-4xl font-black text-red-500 tracking-widest animate-pulse">CONNECTION LOST</h2>
        <p className="text-gray-400 mt-4 text-xl">Reconnecting to live auction feed...</p>
      </div>
    )}
    <div className={`max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl animate-fade-in-down items-start ${!isConnected ? 'opacity-20 pointer-events-none' : ''}`}>
      
      {/* Left: Image & Details */}
      <div className="flex flex-col h-full">
        <div className="rounded-2xl overflow-hidden mb-6 bg-black h-64 lg:h-[14rem] shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none"></div>
          <img src={auction.imageUrl} alt={auction.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{auction.title}</h2>
          <p className="text-gray-400 mb-4 text-sm leading-relaxed line-clamp-4">{auction.description}</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-auto">Seller <span className="text-gray-300 font-bold ml-2">{auction.seller?.username}</span></p>
        </div>
      </div>

      {/* Middle: Bidding Terminal */}
      <div className="flex flex-col justify-center bg-black/40 p-4 sm:p-8 rounded-2xl border border-white/5 shadow-inner h-full min-h-[300px]">
        
        {isEnded ? (
          <div className="text-center py-8">
            <h3 className="text-red-400 font-bold text-2xl mb-2 uppercase tracking-widest">Auction Ended</h3>
            <p className="text-gray-400 mb-6">Winning Bid: <span className="text-green-400 font-bold text-xl">${auction.currentPrice.toLocaleString()}</span></p>
            <p className="text-gray-400">Winner: {auction.highestBidder?.username || 'No Bids'}</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center border-b border-white/10 pb-6">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Time Remaining</p>
              <p className="text-4xl font-black text-white tracking-widest animate-pulse font-mono">
                {formatDistanceToNow(new Date(auction.endTime))}
              </p>
            </div>

            <div className="mb-8 text-center">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Current Bid</p>
              <p className="text-5xl font-black text-accent text-glow-blue mb-2 font-mono">
                ${auction.currentPrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Highest Bidder: <span className="text-white font-bold">{auction.highestBidder?.username || 'None'}</span>
              </p>
            </div>

            {error && <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-4 text-center text-sm">{error}</div>}
            {success && <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-2 rounded-lg mb-4 text-center animate-bounce text-sm">{success}</div>}

            <form onSubmit={handleBid} className="flex flex-col gap-3 mt-auto">
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">$</span>
                <input 
                  type="number" 
                  min={auction.currentPrice + 1}
                  className="w-full pl-10 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-white font-bold text-xl font-mono shadow-inner transition-all"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  disabled={!user}
                />
              </div>
              <button 
                type="submit" 
                disabled={!user}
                className="w-full py-4 bg-gradient-to-r from-accent to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 transition-all rounded-xl font-black shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white uppercase tracking-widest hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:-translate-y-1"
              >
                {user ? 'Authorize Bid' : 'Login Required'}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Right: Audit Trail (Bid History Feed) */}
      <div className="flex flex-col bg-black/20 p-4 sm:p-6 rounded-2xl border border-white/5 h-[300px] lg:h-[400px]">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 tracking-widest uppercase border-b border-white/10 pb-4 shrink-0">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Live Audit Trail
        </h3>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {auction.bidHistory && auction.bidHistory.length > 0 ? (
            auction.bidHistory.map((bid) => (
              <div key={bid._id || bid.id} className="bg-black/40 border border-white/5 p-3 rounded-lg flex justify-between items-center transition-all hover:bg-black/60 hover:border-accent/30 animate-fade-in-down">
                <div>
                  <p className="font-bold text-accent tracking-wide text-sm">{bid.user?.username || bid.username}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">
                    {new Date(bid.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                  </p>
                </div>
                <div className="font-mono text-lg font-bold text-glow-green text-green-400">
                  ${bid.amount.toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8 font-mono text-xs">
              [ AWAITING INITIATION ]
            </div>
          )}
        </div>
      </div>

    </div>
    </>
  );
};

export default AuctionRoom;
