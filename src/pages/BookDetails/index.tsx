import { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { DataTable, MetricStrip, PageToolbar, Panel, StatusBadge } from '../PremiumPage';
import { books, sales } from '../premiumData';

export default function BookDetails() {
  const { id } = useParams();
  const book = books.find((item) => item.bookNo === id) ?? books[0];
  const details: Array<[string, ReactNode]> = [
    ['Book No.', book.bookNo],
    ['Game', book.game],
    ['Assigned Date', book.assigned],
    ['Status', <StatusBadge value={book.status} />],
  ];

  return (
    <>
      <PageToolbar title={`Book Details - ${book.bookNo}`} subtitle={`${book.game} ticket book performance and sale activity.`} search="Search ticket in book" />
      <MetricStrip items={[
        { label: 'Total Tickets', value: String(book.tickets), tone: 'bg-blue-500' },
        { label: 'Sold', value: String(book.sold), tone: 'bg-emerald-500' },
        { label: 'Unsold', value: String(book.tickets - book.sold), tone: 'bg-orange-500' },
        { label: 'Amount', value: book.amount, tone: 'bg-violet-500' },
      ]} />
      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <Panel className="p-4 sm:p-5">
          <h2 className="text-base font-bold text-slate-950">Book Snapshot</h2>
          <dl className="mt-5 space-y-4 text-sm">
            {details.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <dt className="font-semibold text-slate-500">{label}</dt>
                <dd className="font-bold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel>
          <DataTable columns={['Receipt', 'Game', 'Tickets Sold', 'Amount', 'Date', 'Mode']} rows={sales.map((sale) => [sale.receipt, sale.game, sale.tickets, sale.amount, sale.date, sale.mode])} />
        </Panel>
      </div>
    </>
  );
}
