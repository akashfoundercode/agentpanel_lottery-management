import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../../api/axios';
import { MetricStrip, PageToolbar, Panel } from '../PremiumPage';

interface Book {
  id: number;
  book_number: string;
  sold_at: string | null;
  tickets?: { id: number }[];
  game?: { name: string };
}

export default function Sales() {
  const [soldBooks, setSoldBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchAll() {
      try {
        let page = 1;
        const all: Book[] = [];
        while (true) {
          const res = await api.get('/agent/books', { params: { page, per_page: 100 } });
          const payload = res.data.data;
          const items: Book[] = Array.isArray(payload) ? payload : (payload?.data ?? []);
          all.push(...items);
          if (Array.isArray(payload) || !payload?.last_page || payload.current_page >= payload.last_page) break;
          page++;
        }
        setSoldBooks(all.filter((b) => b.sold_at));
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load sales data');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const filtered = soldBooks.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.book_number?.toLowerCase().includes(q) ||
      b.game?.name?.toLowerCase().includes(q)
    );
  });

  const totalTickets = soldBooks.reduce((s, b) => s + (b.tickets?.length ?? 0), 0);

  const chartData = Object.values(
    soldBooks.reduce<Record<string, { name: string; books: number }>>((acc, b) => {
      const key = b.game?.name ?? 'Unknown';
      if (!acc[key]) acc[key] = { name: key, books: 0 };
      acc[key].books += 1;
      return acc;
    }, {}),
  );

  return (
    <>
      <PageToolbar
        title="Sales"
        subtitle="Sold books and ticket summary."
        search="Search book or game"
        onSearch={setSearch}
      />
      <MetricStrip
        items={[
          { label: 'Sold Books', value: String(soldBooks.length), tone: 'bg-emerald-500' },
          { label: 'Tickets Sold', value: String(totalTickets), tone: 'bg-blue-500' },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Panel>
          {loading ? (
            <p className="p-6 text-slate-500">Loading...</p>
          ) : error ? (
            <p className="p-6 text-red-500">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-slate-500">No sold books found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {['Book No.', 'Game', 'Tickets', 'Sold At'].map((h) => (
                    <th key={h} className="px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{b.book_number}</td>
                    <td className="px-4 py-3 text-slate-600">{b.game?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{b.tickets?.length ?? 0}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(b.sold_at!).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel className="p-5">
          <h2 className="text-base font-bold text-slate-950">Sold Books by Game</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="books" name="Sold Books" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}
