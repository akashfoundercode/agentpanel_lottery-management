import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MetricStrip, PageToolbar, Panel, PageLoader, ErrorBar } from '../PremiumPage';
import api from '../../api/axios';

interface Book {
  id: number;
  book_id: string;
  total_tickets: number;
  status: string;
  assigned_at: string;
  game: { game_name: string; ticket_price: string };
}

export default function Reports() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/agent/books', { params: { per_page: 100 } }).then((res) => {
      const d = res.data.data;
      setBooks(Array.isArray(d) ? d : (d.data ?? []));
    }).catch(() => setError('Failed to load report data.'))
      .finally(() => setLoading(false));
  }, []);

  const total = books.length;
  const sold = books.filter((b) => b.status === 'sold').length;
  const unsold = books.filter((b) => b.status === 'unsold').length;
  const assigned = books.filter((b) => b.status === 'assigned').length;
  const totalTickets = books.reduce((s, b) => s + b.total_tickets, 0);
  const totalValue = books.reduce((s, b) => s + b.total_tickets * parseFloat(b.game.ticket_price), 0);
  const sellRate = total ? ((sold / total) * 100).toFixed(1) : '0';

  // Books per game
  const gameMap: Record<string, { sold: number; unsold: number; assigned: number }> = {};
  books.forEach((b) => {
    const name = b.game.game_name;
    if (!gameMap[name]) gameMap[name] = { sold: 0, unsold: 0, assigned: 0 };
    if (b.status === 'sold') gameMap[name].sold++;
    else if (b.status === 'unsold') gameMap[name].unsold++;
    else gameMap[name].assigned++;
  });
  const gameChartData = Object.entries(gameMap).map(([name, v]) => ({ name, ...v }));

  // Books by date
  const dateMap: Record<string, number> = {};
  books.forEach((b) => {
    const date = new Date(b.assigned_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    dateMap[date] = (dateMap[date] ?? 0) + 1;
  });
  const dateChartData = Object.entries(dateMap).map(([date, count]) => ({ date, count }));

  const donutData = [
    { name: 'Sold', value: sold, color: '#10b981' },
    { name: 'Unsold', value: unsold, color: '#f97316' },
    { name: 'Assigned', value: assigned, color: '#3b82f6' },
  ];

  return (
    <>
      <PageToolbar title="Reports" subtitle="Book movement, status breakdown, and assignment analytics." search="Search report" />
      {error && <ErrorBar message={error} />}
      {loading ? <PageLoader /> : <>
      <MetricStrip items={[
        { label: 'Total Books', value: String(total), tone: 'bg-blue-500' },
        { label: 'Total Tickets', value: String(totalTickets), tone: 'bg-cyan-500' },
        { label: 'Total Value', value: `₹${totalValue.toLocaleString('en-IN')}`, tone: 'bg-emerald-500' },
        { label: 'Sell Rate', value: `${sellRate}%`, tone: 'bg-violet-500' },
      ]} />

      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        {/* Books per game bar chart */}
        <Panel className="p-4">
          <h2 className="mb-4 text-sm font-bold text-slate-950">Books by Game</h2>
          {gameChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gameChartData} margin={{ left: 0, right: 8 }}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="sold" name="Sold" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="unsold" name="Unsold" fill="#f97316" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="assigned" name="Assigned" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="py-10 text-center text-xs text-slate-400">No data available.</p>}
        </Panel>

        {/* Donut status breakdown */}
        <Panel className="p-4">
          <h2 className="mb-4 text-sm font-bold text-slate-950">Book Status</h2>
          <div className="relative h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={2}>
                  {donutData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-black text-slate-950">{total}</p>
              <p className="text-[11px] text-slate-400">Total</p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {donutData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-600">{item.name}</span>
                </div>
                <span className="font-black text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Assignments by date */}
      {dateChartData.length > 0 && (
        <Panel className="mt-4 p-4">
          <h2 className="mb-4 text-sm font-bold text-slate-950">Assignments Over Time</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dateChartData} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Books Assigned" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}
      </>
      }
    </>
  );
}
