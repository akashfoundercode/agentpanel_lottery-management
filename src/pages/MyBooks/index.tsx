import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, LockKeyhole } from 'lucide-react';
import { MetricStrip, PageToolbar, Panel, StatusBadge, PageLoader, ErrorBar } from '../PremiumPage';
import api from '../../api/axios';

interface Book {
  id: number;
  book_id: string;
  agent_id: number;
  total_tickets: number;
  draw_date: string;
  status: string;
  assigned_at: string;
  game: { id?: number; game_id?: number; game_name: string; ticket_price: string; status?: string | null };
  tickets: { ticket_number: string }[];
}

interface PaginatedResponse {
  data: Book[];
  current_page: number;
  last_page: number;
  total: number;
}

interface ConfirmState {
  book: Book;
  type: 'sold' | 'unsold';
}

interface LockStatus {
  is_locked: boolean;
  remaining_minutes: number;
  lock_deadline_at: string | null;
}

const isGameLive = (book: Book) => {
  const status = book.game.status?.toLowerCase();
  return status === 'live' || status === 'active';
};

const normalizedBookStatus = (book: Book) => book.status.toLowerCase();

function ConfirmModal({ confirm, onClose, onConfirm, loading }: {
  confirm: ConfirmState;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const isSold = confirm.type === 'sold';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className={`flex items-center gap-3 rounded-t-xl px-5 py-4 ${isSold ? 'bg-emerald-50' : 'bg-orange-50'}`}>
          {isSold
            ? <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
            : <XCircle className="h-6 w-6 shrink-0 text-orange-500" />}
          <p className={`text-sm font-black ${isSold ? 'text-emerald-700' : 'text-orange-700'}`}>
            Mark as {isSold ? 'Sold' : 'Unsold'}
          </p>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to mark book
            <span className="mx-1 font-black text-slate-900">{confirm.book.book_id}</span>
            as <span className={`font-black ${isSold ? 'text-emerald-600' : 'text-orange-600'}`}>{isSold ? 'Sold' : 'Unsold'}</span>?
          </p>

          <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Game</span>
              <span className="font-bold text-slate-700">{confirm.book.game.game_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Tickets</span>
              <span className="font-bold text-slate-700">{confirm.book.total_tickets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ticket Price</span>
              <span className="font-bold text-slate-700">₹{parseFloat(confirm.book.game.ticket_price).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Draw Date</span>
              <span className="font-bold text-slate-700">{new Date(confirm.book.draw_date).toLocaleDateString('en-IN')}</span>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-400">This action will be reported to the admin immediately.</p>
        </div>

        <div className="flex gap-2 border-t border-slate-100 px-5 py-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-lg py-2 text-xs font-black text-white disabled:opacity-50 ${isSold ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            {loading ? 'Please wait...' : `Yes, Mark as ${isSold ? 'Sold' : 'Unsold'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [lockStatuses, setLockStatuses] = useState<Record<number, LockStatus>>({});

  const fetchBooks = () => {
    setFetchLoading(true);
    setError('');
    api.get('/agent/books', { params: { page, search: search || undefined } }).then((res) => {
      const d: PaginatedResponse = res.data.data;
      const sorted = [...d.data].sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime());
      setBooks(sorted);
      setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total });
      const gameIds = [...new Set(sorted.map((book) => book.game.id ?? book.game.game_id).filter((id): id is number => id !== undefined))];
      return Promise.all(gameIds.map(async (gameId) => {
        const response = await api.get(`/admin/games/${gameId}/lock-status`);
        const status = response.data.data as LockStatus;
        return [gameId, status] as const;
      }));
    }).catch(() => setError('Failed to load books. Please try again.'))
      .then((statuses) => {
        if (statuses) setLockStatuses(Object.fromEntries(statuses));
      })
      .finally(() => setFetchLoading(false));
  };

  useEffect(() => {
    fetchBooks();
    window.addEventListener('focus', fetchBooks);
    const timer = window.setInterval(fetchBooks, 30000);
    return () => {
      window.removeEventListener('focus', fetchBooks);
      window.clearInterval(timer);
    };
  }, [page, search]);

  const handleConfirm = async () => {
    if (!confirm) return;
    setLoading(true);
    try {
      await api.post(`/agent/books/${confirm.type}`, { book_id: confirm.book.id, agent_id: confirm.book.agent_id });
      setConfirm(null);
      fetchBooks();
    } finally {
      setLoading(false);
    }
  };

  const totalTickets = books.reduce((s, b) => s + (b.tickets?.length ?? b.total_tickets), 0);
  const soldBooks = books.filter((b) => normalizedBookStatus(b) === 'sold').length;
  const assignedBooks = books.filter((b) => normalizedBookStatus(b) === 'assigned').length;
  const gameNames = [...new Set(books.map((b) => b.game.game_name))];
  const filteredBooks = activeGame ? books.filter((b) => b.game.game_name === activeGame) : books;
  const isBookLocked = (book: Book) => normalizedBookStatus(book) === 'assigned'
    && Boolean(lockStatuses[book.game.id ?? book.game.game_id ?? -1]?.is_locked);

  return (
    <>
      {confirm && (
        <ConfirmModal
          confirm={confirm}
          onClose={() => setConfirm(null)}
          onConfirm={handleConfirm}
          loading={loading}
        />
      )}

      <PageToolbar
        title="My Books"
        subtitle="Assigned ticket books — mark each book as sold or unsold."
        search="Search book number"
        onSearch={setSearch}
      />
      {error && <ErrorBar message={error} />}
      <MetricStrip items={[
        { label: 'Total Books', value: String(meta.total), tone: 'bg-blue-500' },
        { label: 'Total Tickets', value: String(totalTickets), tone: 'bg-cyan-500' },
        { label: 'Sold Books', value: String(soldBooks), tone: 'bg-emerald-500' },
        { label: 'Assigned Books', value: String(assignedBooks), tone: 'bg-orange-500' },
      ]} />
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveGame(null)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${activeGame === null
            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
            : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
            }`}
        >
          All Games
        </button>
        {gameNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveGame(name)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${activeGame === name
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
              }`}
          >
            {name}
          </button>
        ))}
      </div>
      <Panel>
        {fetchLoading ? <PageLoader /> : <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                {['Book ID', 'Game', 'Game Status', 'Draw Date', 'Assigned At', 'Action'].map((col) => (
                  <th key={col} className="px-3 py-2">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="text-slate-700 hover:bg-blue-50/40">
                  <td className="whitespace-nowrap px-3 py-2.5 font-bold text-blue-600">{book.book_id}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{book.game.game_name}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {isBookLocked(book) ? (
                      <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                        <LockKeyhole size={13} />
                        Unsold by Admin
                      </div>
                    ) : isGameLive(book) ? (
                      <StatusBadge value="Live" />
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-100">
                        Game Not Live
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">{new Date(book.draw_date).toLocaleDateString('en-IN')}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{new Date(book.assigned_at).toLocaleDateString('en-IN')}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {isBookLocked(book) ? (
                      <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                        <LockKeyhole size={13} />
                        Unsold by Admin
                      </div>
                    ) : normalizedBookStatus(book) === 'assigned' ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setConfirm({ book, type: 'sold' })}
                          className="rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-600"
                        >
                          Sold
                        </button>
                        <button
                          onClick={() => setConfirm({ book, type: 'unsold' })}
                          className="rounded-md bg-orange-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-orange-600"
                        >
                          Unsold
                        </button>
                      </div>
                    ) : normalizedBookStatus(book) === 'sold' ? (
                      <StatusBadge value="Sold" />
                    ) : normalizedBookStatus(book) === 'unsold' ? (
                      <StatusBadge value="Unsold" />
                    ) : (
                      <StatusBadge value={book.status} />
                    )}
                  </td>
                </tr>
              ))}
              {filteredBooks.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-400">No books found.</td></tr>
              )}
            </tbody>
          </table>
        </div>}
        {!fetchLoading && meta.last_page > 1 && (
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
