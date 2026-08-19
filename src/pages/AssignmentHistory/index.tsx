import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MetricStrip, PageToolbar, Panel, StatusBadge } from '../PremiumPage';
import api from '../../api/axios';

interface Book {
  id: number;
  book_id: string;
  total_tickets: number;
  status: string;
  assigned_at: string;
  sold_at: string | null;
  unsold_at: string | null;
  expiry_at: string;
  game: { game_name: string };
}

interface PaginatedResponse {
  data: Book[];
  current_page: number;
  last_page: number;
  total: number;
}

const fmt = (d: string | null) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export default function AssignmentHistory() {
  const [books, setBooks] = useState<Book[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/agent/books', { params: { page, search: search || undefined } }).then((res) => {
      const d: PaginatedResponse = res.data.data;
      setBooks(d.data ?? []);
      setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total });
    });
  }, [page, search]);

  const soldCount = books.filter((b) => b.status === 'sold').length;
  const unsoldCount = books.filter((b) => b.status === 'unsold').length;
  const assignedCount = books.filter((b) => b.status === 'assigned').length;

  return (
    <>
      <PageToolbar
        title="Assignment History"
        subtitle="Timeline of all assigned books with sold, unsold, and expiry details."
        search="Search book ID"
        onSearch={setSearch}
      />
      <MetricStrip items={[
        { label: 'Total Books', value: String(meta.total), tone: 'bg-blue-500' },
        { label: 'Assigned', value: String(assignedCount), tone: 'bg-violet-500' },
        { label: 'Sold', value: String(soldCount), tone: 'bg-emerald-500' },
        { label: 'Unsold', value: String(unsoldCount), tone: 'bg-orange-500' },
      ]} />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                {['Book ID', 'Game', 'Tickets', 'Assigned At', 'Sold At', 'Unsold At', 'Expiry', 'Status'].map((col) => (
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
                  <td className="whitespace-nowrap px-3 py-2.5">{fmt(book.assigned_at)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-emerald-600">{fmt(book.sold_at)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-orange-500">{fmt(book.unsold_at)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-400">{fmt(book.expiry_at)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><StatusBadge value={book.status} /></td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">No assignment history found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {meta.last_page > 1 && (
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
