import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Eye, Users, Activity, ArrowUpRight } from 'lucide-react';

const generateMockData = (multiplier) => [
  { name: 'Mon', views: Math.floor(4000 * multiplier), watchTime: Math.floor(2400 * multiplier) },
  { name: 'Tue', views: Math.floor(3000 * multiplier), watchTime: Math.floor(1398 * multiplier) },
  { name: 'Wed', views: Math.floor(2000 * multiplier), watchTime: Math.floor(9800 * multiplier) },
  { name: 'Thu', views: Math.floor(2780 * multiplier), watchTime: Math.floor(3908 * multiplier) },
  { name: 'Fri', views: Math.floor(1890 * multiplier), watchTime: Math.floor(4800 * multiplier) },
  { name: 'Sat', views: Math.floor(2390 * multiplier), watchTime: Math.floor(3800 * multiplier) },
  { name: 'Sun', views: Math.floor(3490 * multiplier), watchTime: Math.floor(4300 * multiplier) },
];

const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-bg-card border border-border-dark p-6 rounded-xl shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</h3>
      <div className="p-2 bg-slate-800 rounded-lg text-brand-purple">{icon}</div>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-3xl font-bold text-white">{value}</span>
      <div className="flex items-center text-green-400 text-sm font-medium">
        <ArrowUpRight size={16} className="mr-1" />
        {trend}
      </div>
    </div>
  </div>
);

const AnalyticsView = () => {
  const [timeRange, setTimeRange] = React.useState('7D');
  const [data, setData] = React.useState(generateMockData(1));
  const [stats, setStats] = React.useState({ views: '24.5K', subs: '1,240', eng: '6.8%' });

  const handleRangeChange = (e) => {
    const val = e.target.value;
    setTimeRange(val);
    if (val === '7D') {
      setData(generateMockData(1));
      setStats({ views: '24.5K', subs: '1,240', eng: '6.8%' });
    } else if (val === '30D') {
      setData(generateMockData(4.2));
      setStats({ views: '112.4K', subs: '4,890', eng: '7.1%' });
    } else {
      setData(generateMockData(52.1));
      setStats({ views: '1.4M', subs: '62,400', eng: '8.4%' });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-bg-dark p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase">Performance Analytics</h1>
          <select 
            value={timeRange} 
            onChange={handleRangeChange} 
            className="bg-bg-card border border-border-dark text-slate-300 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-brand-orange"
          >
            <option value="7D">Last 7 Days</option>
            <option value="30D">Last 30 Days</option>
            <option value="1Y">This Year</option>
          </select>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Views" value={stats.views} icon={<Eye size={20} />} trend="+12.5%" />
          <StatCard title="New Subscribers" value={stats.subs} icon={<Users size={20} />} trend="+8.2%" />
          <StatCard title="Engagement Rate" value={stats.eng} icon={<Activity size={20} />} trend="+2.4%" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-bg-card border border-border-dark p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-6">Views Overview</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                  <XAxis dataKey="name" stroke="#718096" tick={{ fill: '#718096' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#718096" tick={{ fill: '#718096' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Line type="monotone" dataKey="views" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-bg-card border border-border-dark p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-6">Watch Time (Minutes)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                  <XAxis dataKey="name" stroke="#718096" tick={{ fill: '#718096' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#718096" tick={{ fill: '#718096' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#334155', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="watchTime" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsView;
