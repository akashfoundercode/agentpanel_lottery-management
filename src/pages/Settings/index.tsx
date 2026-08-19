import { Bell, Lock, Smartphone, Wallet } from 'lucide-react';
import { PageToolbar, Panel } from '../PremiumPage';

const settings = [
  { title: 'Sales Notifications', detail: 'Instant alerts for high-value books and pending settlements.', icon: Bell, enabled: true },
  { title: 'Secure Login', detail: 'Require OTP verification for every new device login.', icon: Lock, enabled: true },
  { title: 'Mobile Sync', detail: 'Keep ticket inventory synced with the mobile agent app.', icon: Smartphone, enabled: true },
  { title: 'Auto Settlement', detail: 'Prepare end-of-day settlement summaries automatically.', icon: Wallet, enabled: false },
];

export default function Settings() {
  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 64px - 2.5rem)' }}>
      <PageToolbar title="Settings" subtitle="Control alerts, security, and operational preferences." search="Search settings" />
      <div className="grid flex-1 auto-rows-fr gap-5 xl:grid-cols-2">
        {settings.map((item) => (
          <Panel key={item.title} className="flex flex-col justify-center p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <item.icon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-slate-950">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p>
              </div>
              <button className={`relative h-7 w-12 rounded-full transition ${item.enabled ? 'bg-blue-600' : 'bg-slate-300'}`} aria-label={item.title}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${item.enabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
