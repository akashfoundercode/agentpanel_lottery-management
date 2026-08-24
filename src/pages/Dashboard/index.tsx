import { useEffect, useState } from 'react';
import {
  BookCopy, CheckCircle, ChevronDown,
  Gamepad2, ShoppingCart, Ticket, XCircle
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
import { Panel, ErrorBar, PageLoader } from '../PremiumPage';
import api from '../../api/axios';

interface DashboardStats {
  total_books: number;
  available_books: number;
  assigned_books: number;
  sold_books: number;
  unsold_books: number;
  unsold_by_admin_books: number;
  total_tickets: number;
  total_games?: number;
}

interface AgentInfo {
  agent_name: string;
  agent_id: string;
  agent_type: string;
  status: string;
}

const salesTrend = [
  { day: '18 May', sales: 5000 },
  { day: '19 May', sales: 10600 },
  { day: '20 May', sales: 7800 },
  { day: '21 May', sales: 16800 },
  { day: '22 May', sales: 8100 },
  { day: '23 May', sales: 12400 },
  { day: '24 May', sales: 18750 },
];



const colorMap: Record<string, { icon: string; bg: string; line: string }> = {

  blue: { icon: 'bg-blue-100 text-blue-600', bg: '#dbeafe', line: '#2563eb' },
  emerald: { icon: 'bg-emerald-100 text-emerald-600', bg: '#dcfce7', line: '#059669' },
  violet: { icon: 'bg-violet-100 text-violet-600', bg: '#ede9fe', line: '#7c3aed' },
  orange: { icon: 'bg-orange-100 text-orange-600', bg: '#ffedd5', line: '#f97316' },
  rose: { icon: 'bg-rose-100 text-rose-600', bg: '#ffe4e6', line: '#f43f5e' },
  cyan: { icon: 'bg-cyan-100 text-cyan-600', bg: '#cffafe', line: '#06b6d4' },
};

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  const points = values.map((value, index) => `${index * 16},${34 - value * 1.5}`).join(' ');

  return (
    <svg viewBox="0 0 150 38" className="mt-2 h-7 w-full" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [totalGames, setTotalGames] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  void agentInfo;
  void totalGames;

  useEffect(() => {
    Promise.all([
      api.get('/agent/dashboard').then((res) => {
        setStats(res.data.data.statistics);
        setAgentInfo(res.data.data.agent);
      }),
      api.get('/agent/games').then((res) => {
        const d = res.data.data;
        setTotalGames(Array.isArray(d) ? d.length : (d?.total ?? d?.data?.length ?? 0));
      }),
    ]).catch(() => setError('Failed to load dashboard data.')).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { name: 'Total Books', value: stats?.total_books ?? '-', subtext: 'All Books', icon: BookCopy, color: 'blue', data: [10, 12, 9, 14, 10, 15, 11, 17, 12, 14] },
    { name: 'Total Tickets', value: stats?.total_tickets == null ? '-' : stats.total_tickets * 10, subtext: 'All Tickets', icon: Ticket, color: 'emerald', data: [8, 10, 13, 9, 14, 10, 12, 16, 11, 13] },
    { name: 'Assigned Games', value: totalGames || '-', subtext: 'Games Assigned', icon: Gamepad2, color: 'violet', data: [4, 5, 6, 4, 7, 5, 6, 8, 5, 7] },
    { name: 'Sold Books', value: stats?.sold_books ?? '-', subtext: 'Books Sold', icon: CheckCircle, color: 'cyan', data: [6, 8, 7, 12, 7, 11, 8, 13, 9, 12] },
    { name: 'Unsold Books', value: stats?.unsold_books ?? '-', subtext: 'Books Unsold', icon: XCircle, color: 'orange', data: [9, 10, 13, 8, 12, 7, 11, 15, 9, 12] },
    { name: 'Assigned Books', value: stats?.assigned_books ?? '-', subtext: 'Currently Assigned', icon: ShoppingCart, color: 'rose', data: [7, 9, 12, 8, 13, 7, 10, 16, 9, 12] },
  ];

  return (
    <div className="space-y-3 lg:space-y-4">
      {error && <ErrorBar message={error} />}
      {loading ? <PageLoader /> : <>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const colors = colorMap[stat.color];
            return (
              <Panel key={stat.name} className="p-3">
                <div className="flex items-start gap-2.5">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colors.icon}`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700">{stat.name}</p>
                    <p className="mt-0.5 text-xl font-black tracking-tight text-slate-950">{stat.value}</p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">{stat.subtext}</p>
                  </div>
                </div>
                <MiniSparkline values={stat.data} color={colors.line} />
              </Panel>
            );
          })}
        </div>

        <div className="grid gap-4">
          <Panel className="p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-950">Sales Overview</h2>
              <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
                This Week
                <ChevronDown size={14} />
              </button>
            </div>
            <div className="h-52 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${Number(value) / 1000}K`} tick={{ fill: '#64748b', fontSize: 11 }} width={42} />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']} />
                  <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2.5} fill="url(#salesFill)" activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </>
      }
    </div>
  );
}
