import { Search, Ticket } from 'lucide-react';
import { DataTable, MetricStrip, PageToolbar, Panel, StatusBadge } from '../PremiumPage';
import { books } from '../premiumData';

export default function TickerSearch() {
  return (
    <>
      <PageToolbar title="Ticker Search" subtitle="Find ticket availability across assigned books instantly." search="Enter ticket number" />
      <MetricStrip items={[
        { label: 'Searchable Tickets', value: '25,600', tone: 'bg-blue-500' },
        { label: 'Available Now', value: '6,850', tone: 'bg-emerald-500' },
        { label: 'Sold Tickets', value: '18,750', tone: 'bg-orange-500' },
        { label: 'Last Sync', value: '2 min', tone: 'bg-violet-500' },
      ]} />
      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <Panel className="p-4 sm:p-5">
          <h2 className="text-base font-bold text-slate-950">Premium Search</h2>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Ticket Number</span>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input className="h-12 w-full rounded-md border border-slate-200 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="Example: 458921" />
              </div>
            </label>
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
              <Ticket size={18} />
              Check Ticket
            </button>
          </div>
        </Panel>
        <Panel>
          <DataTable columns={['Book No.', 'Game', 'Matched Range', 'Tickets', 'Availability', 'Status']} rows={books.map((book) => [book.bookNo, book.game, `${book.bookNo}-001 to ${book.bookNo}-${book.tickets}`, book.tickets, book.tickets - book.sold, <StatusBadge value={book.status} />])} />
        </Panel>
      </div>
    </>
  );
}
