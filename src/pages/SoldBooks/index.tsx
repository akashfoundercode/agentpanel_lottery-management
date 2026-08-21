import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MetricStrip, PageToolbar, Panel, StatusBadge, PageLoader, ErrorBar } from '../PremiumPage';
import api from '../../api/axios';

interface Book {
  id: number;
  book_id: string;
  total_tickets: number;
  status: string;
  sold_at: string | null;
  assigned_at: string;
  game: { game_name: string; ticket_price: string };
}

interface PaginatedResponse {
  data: Book[];
  current_page: number;
  last_page: number;
  total: number;
}

export default function SoldBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/agent/books', { params: { page, search: search || undefined, status: 'sold' } })
      .then((res) => {
        const d: PaginatedResponse = res.data.data;
        setBooks(d.data ?? []);
        setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total });
      }).catch(() => setError('Failed to load sold books.'))
      .finally(() => setLoading(false));
  }, [page, search]);

  const totalValue = books.reduce((s, b) => s + b.total_tickets * parseFloat(b.game.ticket_price), 0);

  return (
    <>
      <PageToolbar title="Sold Books" subtitle="Books marked as sold by you." search="Search sold book" onSearch={setSearch} />
      {error && <ErrorBar message={error} />}
      <MetricStrip items={[
        { label: 'Total Sold', value: String(meta.total), tone: 'bg-emerald-500' },
        { label: 'This Page', value: String(books.length), tone: 'bg-blue-500' },
        { label: 'Sales Value', value: `₹${totalValue.toLocaleString('en-IN')}`, tone: 'bg-violet-500' },
      ]} />
      <Panel>
        {loading ? <PageLoader /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {['Book ID', 'Game', 'Tickets', 'Ticket Price', 'Sold At', 'Status'].map((col) => (
                    <th key={col} className="px-3 py-2">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((book) => (
                  <tr key={book.id} className="text-slate-700 hover:bg-blue-50/40">
                    <td className="whitespace-nowrap px-3 py-2.5 font-bold text-blue-600">{book.book_id}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{book.game.game_name}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{book.total_tickets}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">₹{parseFloat(book.game.ticket_price).toLocaleString('en-IN')}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{book.sold_at ? new Date(book.sold_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2.5"><StatusBadge value={book.status} /></td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-400">No sold books found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
