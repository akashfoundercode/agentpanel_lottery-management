import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Youtube, Facebook } from 'lucide-react';
import { MetricStrip, PageToolbar, Panel, StatusBadge, PageLoader, ErrorBar } from '../PremiumPage';
import api from '../../api/axios';

interface Game {
  id: number;
  game_name: string;
  game_id: string;
  game_image_url: string | null;
  ticket_price: string;
  book_size: number;
  total_books: number;
  draw_date: string;
  draw_time: string;
  youtube_live_url: string;
  facebook_live_url: string;
  status: string;
}

export default function MyGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/agent/games', { params: { page, search: search || undefined } }).then((res) => {
      const d = res.data.data;
      if (Array.isArray(d)) {
        setGames(d);
        setMeta({ current_page: 1, last_page: 1, total: d.length });
      } else {
        setGames(d.data ?? []);
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total });
      }
    }).catch(() => setError('Failed to load games. Please try again.'))
      .finally(() => setLoading(false));
  }, [page, search]);

  const activeCount = games?.filter((g) => g.status === 'active').length ?? 0;
  const totalBooks = games?.reduce((s, g) => s + g.total_books, 0) ?? 0;
  const totalTickets = games?.reduce((s, g) => s + g.total_books * g.book_size, 0) ?? 0;

  return (
    <>
      <PageToolbar
        title="My Games"
        subtitle="Live and upcoming lucky draw games assigned to your agent account."
        search="Search game name"
        onSearch={setSearch}
      />
      {error && <ErrorBar message={error} />}
      <MetricStrip items={[
        { label: 'Total Games', value: String(games?.length ?? 0), tone: 'bg-blue-500' },
        { label: 'Active Games', value: String(activeCount), tone: 'bg-emerald-500' },
        { label: 'Total Books', value: totalBooks.toLocaleString('en-IN'), tone: 'bg-violet-500' },
        { label: 'Total Tickets', value: totalTickets.toLocaleString('en-IN'), tone: 'bg-amber-400' },
      ]} />
      <Panel>
        {loading ? <PageLoader /> : <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                {['Game Name', 'Game ID', 'Ticket Price', 'Book Size', 'Total Books', 'Draw Date & Time', 'Live Links', 'Status'].map((col) => (
                  <th key={col} className="px-3 py-2">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {games.map((game) => (
                <tr key={game.id} className="text-slate-700 hover:bg-blue-50/40">
                  <td className="whitespace-nowrap px-3 py-2.5 font-bold text-slate-900">{game.game_name}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-slate-500">{game.game_id}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">₹{parseFloat(game.ticket_price).toLocaleString('en-IN')}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{game.book_size}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{game.total_books.toLocaleString('en-IN')}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <p>{new Date(game.draw_date).toLocaleDateString('en-IN')}</p>
                    <p className="text-slate-400">{game.draw_time}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <div className="flex gap-2">
                      <a href={game.youtube_live_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100">
                        <Youtube size={12} /> YouTube
                      </a>
                      <a href={game.facebook_live_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-100">
                        <Facebook size={12} /> Facebook
                      </a>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5"><StatusBadge value={game.status} /></td>
                </tr>
              ))}
              {games.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">No games found.</td></tr>
              )}
            </tbody>
          </table>
        </div>}
        {!loading && meta.last_page > 1 && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-3">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={meta.current_page === 1}
              className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-600">{meta.current_page} / {meta.last_page}</span>
            <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={meta.current_page === meta.last_page}
              className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </Panel>
    </>
  );
}
