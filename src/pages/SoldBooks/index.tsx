import { DataTable, MetricStrip, PageToolbar, Panel, StatusBadge } from '../PremiumPage';
import { books } from '../premiumData';

export default function SoldBooks() {
  return (
    <>
      <PageToolbar title="Sold Books" subtitle="Books with strong sell-through and confirmed sales value." search="Search sold book" />
      <MetricStrip items={[
        { label: 'Sold Books', value: '94', tone: 'bg-emerald-500' },
        { label: 'Sold Tickets', value: '18,750', tone: 'bg-blue-500' },
        { label: 'Sell Through', value: '73.24%', tone: 'bg-violet-500' },
        { label: 'Sales Value', value: '₹18.75L', tone: 'bg-amber-400' },
      ]} />
      <Panel>
        <DataTable columns={['Book No.', 'Game', 'Tickets Sold', 'Amount', 'Assigned Date', 'Status']} rows={books.map((book) => [book.bookNo, book.game, book.sold, book.amount, book.assigned, <StatusBadge value="Published" />])} />
      </Panel>
    </>
  );
}
