import { DataTable, MetricStrip, PageToolbar, Panel, StatusBadge } from '../PremiumPage';
import { books } from '../premiumData';

export default function UnsoldBooks() {
  return (
    <>
      <PageToolbar title="Unsold Books" subtitle="Remaining inventory and follow-up priority by game." search="Search unsold book" />
      <MetricStrip items={[
        { label: 'Unsold Tickets', value: '6,850', tone: 'bg-orange-500' },
        { label: 'Open Books', value: '34', tone: 'bg-blue-500' },
        { label: 'At Risk', value: '8', tone: 'bg-rose-500' },
        { label: 'Recovery Target', value: '₹6.85L', tone: 'bg-violet-500' },
      ]} />
      <Panel>
        <DataTable columns={['Book No.', 'Game', 'Total Tickets', 'Sold', 'Unsold', 'Priority']} rows={books.map((book) => [book.bookNo, book.game, book.tickets, book.sold, book.tickets - book.sold, <StatusBadge value={book.tickets - book.sold > 60 ? 'Settling' : 'Active'} />])} />
      </Panel>
    </>
  );
}
