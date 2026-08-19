import { DataTable, MetricStrip, PageToolbar, Panel, StatusBadge } from '../PremiumPage';
import { results } from '../premiumData';

export default function Results() {
  return (
    <>
      <PageToolbar title="Results" subtitle="Published draw results with winning numbers and prize value." search="Search draw or game" />
      <MetricStrip items={[
        { label: 'Published Results', value: '42', tone: 'bg-blue-500' },
        { label: 'Verified Draws', value: '39', tone: 'bg-emerald-500' },
        { label: 'Pending Review', value: '3', tone: 'bg-amber-400' },
        { label: 'Prize Declared', value: '₹24.5L', tone: 'bg-violet-500' },
      ]} />
      <Panel>
        <DataTable columns={['Game', 'Draw No.', 'Winning No.', 'Prize', 'Date', 'Status']} rows={results.map((result) => [result.game, result.drawNo, <span className="font-black tracking-[0.2em] text-slate-950">{result.winning}</span>, result.prize, result.date, <StatusBadge value={result.status} />])} />
      </Panel>
    </>
  );
}
