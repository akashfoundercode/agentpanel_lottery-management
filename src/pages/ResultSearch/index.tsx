import { Search } from 'lucide-react';
import { DataTable, PageToolbar, Panel, StatusBadge } from '../PremiumPage';
import { results } from '../premiumData';

export default function ResultSearch() {
  return (
    <>
      <PageToolbar title="Result Search" subtitle="Search published result numbers, draw IDs, and prize status." search="Search winning number" />
      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <Panel className="p-4 sm:p-5">
          <h2 className="text-base font-bold text-slate-950">Result Lookup</h2>
          <div className="mt-5 space-y-4">
            {['Draw Number', 'Game Name', 'Ticket Number'].map((label) => (
              <label key={label} className="block">
                <span className="text-sm font-bold text-slate-700">{label}</span>
                <input className="mt-2 h-11 w-full rounded-md border border-slate-200 px-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder={label} />
              </label>
            ))}
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
              <Search size={18} />
              Search Results
            </button>
          </div>
        </Panel>
        <Panel>
          <DataTable columns={['Game', 'Draw No.', 'Winning No.', 'Prize', 'Date', 'Status']} rows={results.map((result) => [result.game, result.drawNo, result.winning, result.prize, result.date, <StatusBadge value={result.status} />])} />
        </Panel>
      </div>
    </>
  );
}
