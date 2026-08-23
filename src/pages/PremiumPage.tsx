import { ReactNode } from 'react';
import { ArrowRight, Download, Filter, Search, Loader2, AlertCircle } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      <span className="ml-2.5 text-sm font-medium text-slate-400">Loading...</span>
    </div>
  );
}

export function ErrorBar({ message }: { message: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">
      <AlertCircle size={14} className="shrink-0" />
      {message}
    </div>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-md border border-slate-200/80 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.045)] ${className}`}>
      {children}
    </section>
  );
}

export function PanelHeader({ title, action = 'View All' }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5">
      <h2 className="text-[13px] font-bold text-slate-950 sm:text-sm">{title}</h2>
      <button className="inline-flex h-7 items-center gap-1 rounded-md border border-blue-100 px-2 text-[11px] font-semibold text-blue-600 hover:bg-blue-50">
        {action}
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const tone = value.toLowerCase();
  const label = tone === 'unsold_by_admin' ? 'Unsold by Admin' : value;
  const styles = tone === 'unsold_by_admin'
    ? 'bg-slate-100 text-slate-600 ring-slate-200'
    : tone.includes('live') || tone.includes('active') || tone.includes('published')
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
      : tone.includes('upcoming') || tone.includes('verified')
        ? 'bg-blue-50 text-blue-700 ring-blue-100'
        : tone.includes('settling')
          ? 'bg-amber-50 text-amber-700 ring-amber-100'
          : 'bg-slate-50 text-slate-600 ring-slate-100';

  return <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-bold uppercase ring-1 ${styles}`}>{label}</span>;
}

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-xs">
        <thead>
          <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            {columns.map((column) => (
              <th key={column} className="px-3 py-2">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="text-slate-700 hover:bg-blue-50/40">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="whitespace-nowrap px-3 py-2.5">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PageToolbar({ title, subtitle, search = 'Search records', onSearch }: { title: string; subtitle: string; search?: string; onSearch?: (v: string) => void }) {
  return (
    <div className="mb-3 flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">Lucky Draw Agent Panel</p>
        <h1 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">{title}</h1>
        <p className="mt-0.5 max-w-2xl text-xs leading-5 text-slate-500">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:w-52 lg:w-60" placeholder={search} onChange={(e) => onSearch?.(e.target.value)} />
        </label>
        <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
          <Filter size={15} />
          Filter
        </button>
        <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
          <Download size={15} />
          Export
        </button>
      </div>
    </div>
  );
}

export function MetricStrip({ items }: { items: Array<{ label: string; value: string; tone: string }> }) {
  return (
    <div className="mb-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Panel key={item.label} className="p-3">
          <p className="text-xs font-semibold text-slate-500">{item.label}</p>
          <div className="mt-1.5 flex items-end justify-between">
            <p className="text-lg font-black text-slate-950 sm:text-xl">{item.value}</p>
            <span className={`h-1.5 w-10 rounded-full sm:w-12 ${item.tone}`} />
          </div>
        </Panel>
      ))}
    </div>
  );
}
