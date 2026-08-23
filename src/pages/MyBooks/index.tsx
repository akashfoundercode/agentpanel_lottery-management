import { useEffect, useState } from 'react';
import { CheckCircle2, LockKeyhole, RefreshCw, XCircle } from 'lucide-react';
import { MetricStrip, PageToolbar, Panel, StatusBadge, PageLoader, ErrorBar } from '../PremiumPage';
import api from '../../api/axios';

interface BookStatus {
    book_id: number | string;
    book_number: string | number;
    status: string;
    deadline_at: string | null;
    is_locked: boolean;
    can_update_status: boolean;
    can_request_reopen: boolean;
    game_status: string | null;
    game_live_at: string | null;
}

interface Agent { id?: number | string; agent_id?: number | string; }
interface ConfirmState { book: BookStatus; type: 'sold' | 'unsold'; }

function getBooks(payload: unknown): BookStatus[] {
    if (Array.isArray(payload)) return payload as BookStatus[];
    if (!payload || typeof payload !== 'object') return [];
    const value = payload as { data?: unknown; books?: unknown };
    if (Array.isArray(value.data)) return value.data as BookStatus[];
    if (Array.isArray(value.books)) return value.books as BookStatus[];
    return value.data && typeof value.data === 'object' ? getBooks(value.data) : [];
}

function getAgent(payload: unknown): Agent | null {
    if (!payload || typeof payload !== 'object') return null;
    const value = payload as { data?: unknown; agent?: unknown; id?: number | string; agent_id?: number | string };
    if (value.id !== undefined || value.agent_id !== undefined) return value;
    if (value.agent && typeof value.agent === 'object') return value.agent as Agent;
    return value.data && typeof value.data === 'object' ? getAgent(value.data) : null;
}

const formatDate = (value: string | null) => value
    ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

function ConfirmModal({ confirm, onClose, onConfirm, loading }: { confirm: ConfirmState; onClose: () => void; onConfirm: () => void; loading: boolean }) {
    const isSold = confirm.type === 'sold';
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className={`flex items-center gap-3 rounded-t-xl px-5 py-4 ${isSold ? 'bg-emerald-50' : 'bg-orange-50'}`}>
                {isSold ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <XCircle className="h-6 w-6 text-orange-500" />}
                <p className={`text-sm font-black ${isSold ? 'text-emerald-700' : 'text-orange-700'}`}>Mark as {isSold ? 'Sold' : 'Unsold'}</p>
            </div>
            <p className="px-5 py-5 text-sm text-slate-600">Are you sure you want to mark book <span className="font-black text-slate-900">{confirm.book.book_number}</span> as {isSold ? 'sold' : 'unsold'}?</p>
            <div className="flex gap-2 border-t border-slate-100 px-5 py-3">
                <button onClick={onClose} disabled={loading} className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                <button onClick={onConfirm} disabled={loading} className={`flex-1 rounded-lg py-2 text-xs font-black text-white disabled:opacity-50 ${isSold ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-500 hover:bg-orange-600'}`}>{loading ? 'Please wait...' : `Yes, Mark as ${isSold ? 'Sold' : 'Unsold'}`}</button>
            </div>
        </div>
    </div>;
}

export default function MyBooks() {
    const [books, setBooks] = useState<BookStatus[]>([]);
    const [agent, setAgent] = useState<Agent | null>(null);
    const [confirm, setConfirm] = useState<ConfirmState | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [reopenLoading, setReopenLoading] = useState<number | string | null>(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchBooks = async () => {
        setLoading(true);
        setError('');
        const [statusResult, profileResult] = await Promise.allSettled([api.get('/agent/books/status'), api.get('/agent/profile')]);
        if (statusResult.status === 'fulfilled') {
            setBooks(getBooks(statusResult.value.data));
        } else {
            setError('Failed to load book status. Please try again.');
        }
        if (profileResult.status === 'fulfilled') {
            setAgent(getAgent(profileResult.value.data));
        }
        if (statusResult.status === 'fulfilled' && profileResult.status === 'rejected') {
            setMessage('Book actions are unavailable until your agent profile can be loaded.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBooks();
        window.addEventListener('focus', fetchBooks);
        return () => window.removeEventListener('focus', fetchBooks);
    }, []);

    const agentId = agent?.id ?? agent?.agent_id;

    const handleConfirm = async () => {
        if (!confirm || agentId === undefined) return;
        setActionLoading(true);
        setError('');
        try {
            await api.post(`/agent/books/${confirm.type}`, { book_id: confirm.book.book_id, agent_id: agentId });
            setConfirm(null);
            await fetchBooks();
        } catch {
            setError(`Failed to mark book as ${confirm.type}. Please try again.`);
        } finally {
            setActionLoading(false);
        }
    };

    const requestReopen = async (book: BookStatus) => {
        if (agentId === undefined) return;
        setReopenLoading(book.book_id);
        setError('');
        setMessage('');
        try {
            await api.post('/agent/books/request-reopen', { book_id: book.book_id, agent_id: agentId });
            setMessage(`Reopen request submitted for book ${book.book_number}.`);
            await fetchBooks();
        } catch {
            setError('Failed to request book reopening. Please try again.');
        } finally {
            setReopenLoading(null);
        }
    };

    const soldBooks = books.filter((book) => book.status.toLowerCase() === 'sold').length;
    const unsoldBooks = books.filter((book) => book.status.toLowerCase().includes('unsold')).length;

    return <>
        {confirm && <ConfirmModal confirm={confirm} onClose={() => setConfirm(null)} onConfirm={handleConfirm} loading={actionLoading} />}
        <PageToolbar title="My Books" subtitle="Review assigned book status and update eligible books." />
        {error && <ErrorBar message={error} />}
        {message && <div className="mb-3 rounded-md bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">{message}</div>}
        <MetricStrip items={[{ label: 'Total Books', value: String(books.length), tone: 'bg-blue-500' }, { label: 'Sold Books', value: String(soldBooks), tone: 'bg-emerald-500' }, { label: 'Unsold Books', value: String(unsoldBooks), tone: 'bg-orange-500' }]} />
        <Panel>
            {loading ? <PageLoader /> : <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-xs">
                    <thead><tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">{['Book ID', 'Book Number', 'Status', 'Deadline', 'Locked', 'Game Status', 'Game Live At', 'Action'].map((column) => <th key={column} className="px-3 py-2">{column}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {books.map((book) => {
                            const adminUnsold = book.status.toLowerCase() === 'unsold_by_admin';
                            return <tr key={book.book_id} className="text-slate-700 hover:bg-blue-50/40">
                                <td className="whitespace-nowrap px-3 py-2.5 font-bold text-blue-600">{book.book_id}</td>
                                <td className="whitespace-nowrap px-3 py-2.5 font-semibold">{book.book_number}</td>
                                <td className="whitespace-nowrap px-3 py-2.5">{adminUnsold ? <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600"><LockKeyhole size={13} />Unsold by Admin</span> : <StatusBadge value={book.status} />}</td>
                                <td className="whitespace-nowrap px-3 py-2.5">{formatDate(book.deadline_at)}</td>
                                <td className="whitespace-nowrap px-3 py-2.5">{book.is_locked ? 'Yes' : 'No'}</td>
                                <td className="whitespace-nowrap px-3 py-2.5">{book.game_status ?? '—'}</td>
                                <td className="whitespace-nowrap px-3 py-2.5">{formatDate(book.game_live_at)}</td>
                                <td className="whitespace-nowrap px-3 py-2.5">{book.can_update_status ? <div className="flex gap-1.5"><button onClick={() => setConfirm({ book, type: 'sold' })} className="rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-600">Sold</button><button onClick={() => setConfirm({ book, type: 'unsold' })} className="rounded-md bg-orange-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-orange-600">Unsold</button></div> : book.can_request_reopen ? <button onClick={() => requestReopen(book)} disabled={reopenLoading === book.book_id || agentId === undefined} className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 disabled:opacity-50"><RefreshCw size={13} className={reopenLoading === book.book_id ? 'animate-spin' : ''} />Request Reopen</button> : <span className="text-slate-400">No action</span>}</td>
                            </tr>;
                        })}
                        {books.length === 0 && <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">No books found.</td></tr>}
                    </tbody>
                </table>
            </div>}
        </Panel>
    </>;
}
