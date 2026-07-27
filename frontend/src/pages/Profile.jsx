import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, api, updateBalance } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [endedAuctions, setEndedAuctions] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        const [historyRes, endedRes] = await Promise.all([
          api.get('/auth/history', { headers: { Authorization: `Bearer ${user?.token}` } }),
          api.get('/auctions/ended')
        ]);
        setHistory(historyRes.data);
        setEndedAuctions(endedRes.data);
      } catch (error) {
        console.error('Failed to fetch vault data');
      } finally {
        setLoadingData(false);
      }
    };
    fetchVaultData();
  }, [api]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const depositRes = await api.post('/auth/deposit', 
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      updateBalance(depositRes.data.walletBalance); // refresh user balance
      
      // Refresh transaction history
      const res = await api.get('/auth/history', { headers: { Authorization: `Bearer ${user?.token}` } });
      setHistory(res.data);
      
      setAmount('');
      alert('Deposit successful');
    } catch (error) {
      alert('Failed to deposit funds');
    } finally {
      setLoading(false);
    }
  };

  const HistoryCard = ({ auction }) => (
    <div className="flex flex-col md:flex-row gap-6 p-6 border border-gray-800 bg-surface/50 transition-colors hover:border-gray-600">
      <div className="w-full md:w-48 h-32 bg-black shrink-0 relative overflow-hidden">
        <img src={auction.imageUrl} alt={auction.title} className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
      </div>
      <div className="flex-grow flex flex-col justify-center">
        <h4 className="text-xl font-bold text-white mb-2 serif-heading">{auction.title}</h4>
        <div className="flex items-center gap-6 mt-2">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Winning Bid</p>
            <p className="text-lg font-bold text-gray-300">${auction.currentPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Status</p>
            <p className="text-sm font-bold text-gray-400">Archived</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end md:w-32">
        <Link to={`/auction/${auction._id}`} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">
          View Record
        </Link>
      </div>
    </div>
  );

  const SkeletonHistoryCard = () => (
    <div className="flex flex-col md:flex-row gap-6 p-6 border border-gray-800 bg-surface/30 animate-pulse">
      <div className="w-full md:w-48 h-32 bg-gray-900 shrink-0"></div>
      <div className="flex-grow flex flex-col justify-center">
        <div className="h-6 bg-gray-800 rounded w-1/2 mb-4"></div>
        <div className="flex items-center gap-6 mt-2">
          <div>
            <div className="h-3 bg-gray-800 rounded w-20 mb-2"></div>
            <div className="h-5 bg-gray-800 rounded w-16"></div>
          </div>
          <div>
            <div className="h-3 bg-gray-800 rounded w-16 mb-2"></div>
            <div className="h-5 bg-gray-800 rounded w-24"></div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end md:w-32">
        <div className="h-4 bg-gray-800 rounded w-20"></div>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="animate-fade-in-down pb-4 max-w-5xl mx-auto">
      
      <div className="py-8 mb-8 border-b border-gray-800">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight serif-heading mb-4">
          The Vault
        </h2>
        <p className="text-gray-400 text-lg">Manage your wealth and explore the historical ledger of past auctions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Wallet & Personal Ledger */}
        <div className="lg:col-span-1 space-y-8">
          
          <div className="p-8 border border-gray-800 bg-surface/50">
            <h3 className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-2">Available Balance</h3>
            <p className="text-4xl font-bold text-accent mb-8">${user.walletBalance?.toLocaleString()}</p>
            
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Deposit Funds (USD)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black border border-gray-700 px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                  placeholder="Enter amount"
                  min="1"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-black py-3 font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Add Funds'}
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-6 serif-heading">Transaction Ledger</h3>
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-gray-500 font-serif italic">No transactions yet.</p>
              ) : (
                history.map(tx => (
                  <div key={tx._id} className="p-4 border border-gray-800 flex justify-between items-center bg-surface/30">
                    <div>
                      <p className="text-sm text-gray-300">{tx.description}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-mono font-bold ${tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Global Auction History */}
        <div className="lg:col-span-2">
          <h3 className="text-2xl font-bold text-white mb-8 serif-heading border-b border-gray-800 pb-4">Global Auction History</h3>
          
          {loadingData ? (
            <div className="space-y-4">
              <SkeletonHistoryCard />
              <SkeletonHistoryCard />
              <SkeletonHistoryCard />
            </div>
          ) : endedAuctions.length === 0 ? (
            <div className="text-center py-20 border border-gray-800">
              <p className="text-gray-500 font-serif italic text-lg">The historical archives are empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {endedAuctions.map(auction => (
                <HistoryCard key={auction._id} auction={auction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
