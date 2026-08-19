import { useEffect, useState } from 'react';
import {
  BookCopy, BookOpen, CheckCircle, ChevronDown,
  Gamepad2, MoreVertical, Search, ShoppingCart, Ticket, Trophy, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
import { books, games, sales } from '../premiumData';
import { DataTable, Panel, PanelHeader, StatusBadge } from '../PremiumPage';
import api from '../../api/axios';

interface DashboardStats {
  total_books: number;
  available_books: number;
  assigned_books: number;
  sold_books: number;
  unsold_books: number;
  unsold_by_admin_books: number;
  total_tickets: number;
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
  void agentInfo; // available for header/profile use

  useEffect(() => {
    api.get('/agent/dashboard').then((res) => {
      setStats(res.data.data.statistics);
      setAgentInfo(res.data.data.agent);
    });
  }, []);

  const donutData = [
    { name: 'Sold Books', value: stats?.sold_books ?? 0, color: '#3b82f6' },
    { name: 'Unsold Books', value: stats?.unsold_books ?? 0, color: '#fb923c' },
    { name: 'Available Books', value: stats?.available_books ?? 0, color: '#64748b' },
  ];
  const totalBooks = stats?.total_books ?? 0;

  const statCards = [
    { name: 'Total Books', value: stats?.total_books ?? '-', subtext: 'All Books', icon: BookCopy, color: 'blue', data: [10, 12, 9, 14, 10, 15, 11, 17, 12, 14] },
    { name: 'Total Tickets', value: stats?.total_tickets ?? '-', subtext: 'All Tickets', icon: Ticket, color: 'emerald', data: [8, 10, 13, 9, 14, 10, 12, 16, 11, 13] },
    { name: 'Sold Books', value: stats?.sold_books ?? '-', subtext: 'Books Sold', icon: CheckCircle, color: 'violet', data: [6, 8, 7, 12, 7, 11, 8, 13, 9, 12] },
    { name: 'Unsold Books', value: stats?.unsold_books ?? '-', subtext: 'Books Unsold', icon: XCircle, color: 'orange', data: [9, 10, 13, 8, 12, 7, 11, 15, 9, 12] },
    { name: 'Assigned Books', value: stats?.assigned_books ?? '-', subtext: 'Currently Assigned', icon: ShoppingCart, color: 'rose', data: [7, 9, 12, 8, 13, 7, 10, 16, 9, 12] },
    { name: 'Available Books', value: stats?.available_books ?? '-', subtext: 'Ready to Assign', icon: Gamepad2, color: 'cyan', data: [5, 7, 10, 6, 11, 7, 9, 15, 8, 10] },
  ];

  return (
    <div className="space-y-3 lg:space-y-4">
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

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1.05fr_0.85fr]">
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

        <Panel className="p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-950">Book Status Overview</h2>
            <MoreVertical size={17} className="text-slate-400" />
          </div>
          <div className="grid items-center gap-2.5 sm:grid-cols-[165px_1fr] xl:grid-cols-1 2xl:grid-cols-[165px_1fr]">
            <div className="relative h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" innerRadius={48} outerRadius={68} paddingAngle={0}>
                    {donutData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-black text-slate-950">{totalBooks}</p>
                <p className="text-xs font-medium text-slate-500">Total Books</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {donutData.map((item) => (
                <div key={item.name} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-xs font-bold text-slate-700 sm:text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.value.toLocaleString('en-IN')} ({totalBooks ? ((item.value / totalBooks) * 100).toFixed(1) : 0}%)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="border-b border-slate-100 px-3 py-2.5">
            <h2 className="text-sm font-bold text-slate-950">Quick Actions</h2>
          </div>
          <div className="space-y-2 p-3">
            {[
              { name: 'Search Ticker', href: '/agent/ticker-search', icon: Search, color: 'text-blue-600' },
              { name: 'View My Books', href: '/agent/books', icon: BookOpen, color: 'text-blue-600' },
              { name: 'View Sold Books', href: '/agent/sold-books', icon: CheckCircle, color: 'text-emerald-600' },
              { name: 'View Unsold Books', href: '/agent/unsold-books', icon: XCircle, color: 'text-orange-600' },
              { name: 'View Results', href: '/agent/results', icon: Trophy, color: 'text-violet-600' },
            ].map((action) => (
              <Link key={action.name} to={action.href} className="flex items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm hover:border-blue-200 hover:bg-blue-50">
                <action.icon className={action.color} size={16} />
                <span>{action.name}</span>
                <ChevronDown className="ml-auto -rotate-90 text-slate-400" size={15} />
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel>
          <PanelHeader title="Recent Assigned Books" />
          <DataTable columns={['Book No.', 'Game', 'Tickets', 'Assigned Date', 'Status']} rows={books.map((book) => [book.bookNo, book.game, book.tickets, book.assigned, <StatusBadge value={book.status} />])} />
        </Panel>
        <Panel>
          <PanelHeader title="Recent Sales" />
          <DataTable columns={['Book No.', 'Game', 'Tickets Sold', 'Amount', 'Date']} rows={sales.map((sale) => [sale.bookNo, sale.game, sale.tickets, sale.amount, sale.date])} />
        </Panel>
        <Panel>
          <PanelHeader title="Active Games" />
          <DataTable columns={['Game Name', 'Draw Date', 'Status', 'Books', 'Sold']} rows={games.map((game) => [game.name, game.drawDate, <StatusBadge value={game.status} />, game.books, game.sold])} />
        </Panel>
      </div>
    </div>
  );
}
