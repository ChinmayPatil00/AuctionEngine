import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const Profile = () => {
  const { user, api, updateBalance } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState(1000);
  const [depositing, setDepositing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [api]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await api.get('/auth/history', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositing(true);
    setError('');
    try {
      const res = await api.post('/auth/deposit', { amount: Number(depositAmount) }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      updateBalance(res.data.walletBalance);
      setHistory(prev => [res.data.transaction, ...prev]);
    } catch (err) {
      setError('Failed to process deposit.');
    } finally {
      setDepositing(false);
    }
  };

  if (!user) return <div className="text-center py-20 text-white">Please login to view your profile.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 animate-fade-in-down">
      
      {/* Header Profile Section */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-black shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-black tracking-tight">{user.username}</h1>
            <p className="text-gray-400 mt-1 font-mono">{user.email}</p>
            <div className="mt-4 inline-flex px-4 py-2 bg-white/5 rounded-xl border border-white/10 items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Total Balance</span>
              <span className="text-green-400 font-mono font-black text-xl text-glow-green">${user.walletBalance?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Deposit Section */}
        <div className="bg-black/40 p-6 rounded-2xl border border-white/10 relative z-10 w-full md:w-auto shadow-inner">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Simulate Top-up</h3>
          <form onSubmit={handleDeposit} className="flex gap-2">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
              <input 
                type="number" 
                value={depositAmount} 
                onChange={(e) => setDepositAmount(e.target.value)}
                min="10"
                className="w-32 pl-8 pr-4 py-3 bg-black/60 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white font-mono font-bold"
              />
            </div>
            <button 
              type="submit" 
              disabled={depositing}
              className="px-6 py-3 bg-accent hover:bg-blue-600 transition-colors rounded-xl font-bold uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
            >
              {depositing ? 'Processing...' : 'Deposit'}
            </button>
          </form>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>
      </div>

      {/* Action History Ledger */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="p-6 sm:p-8 border-b border-white/10 bg-black/20">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-accent animate-pulse"></span>
            Action Ledger
          </h2>
          <p className="text-gray-500 text-sm mt-1">Immutable record of all your bids, refunds, and deposits.</p>
        </div>
        
        <div className="p-0 sm:p-4">
          {loading ? (
            <div className="text-center py-20 text-gray-500 font-mono">Decoupling blocks...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-mono text-sm">No actions recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-widest bg-black/40">
                    <th className="p-4 font-bold">Time</th>
                    <th className="p-4 font-bold">Action</th>
                    <th className="p-4 font-bold">Details</th>
                    <th className="p-4 font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((tx) => (
                    <tr key={tx._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="p-4 text-gray-400 text-sm font-mono whitespace-nowrap">
                        {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          tx.type === 'bid' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          tx.type === 'deposit' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          tx.type === 'refund' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          'bg-gray-500/10 text-gray-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-300 font-medium">{tx.description}</p>
                        {tx.auction && (
                          <Link to={`/auction/${tx.auction._id}`} className="text-xs text-accent hover:underline mt-1 block truncate max-w-[200px] sm:max-w-[400px]">
                            {tx.auction.title}
                          </Link>
                        )}
                      </td>
                      <td className={`p-4 text-right font-mono font-bold text-lg ${
                        tx.type === 'bid' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {tx.type === 'bid' ? '-' : '+'}${tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
