import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Gamepad2, BookOpen,
  History, BarChart2, User, LogOut, Menu, Bell, ChevronDown, Calendar, Crown, X,
  BookMarked, Trophy, AlertCircle, Info, CheckCheck, Check
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  
  time: string;
}

function notifIcon(type: string) {
  if (type.includes('book')) return <BookMarked className="h-4 w-4" />;
  if (type.includes('result') || type.includes('win')) return <Trophy className="h-4 w-4" />;
  if (type.includes('alert') || type.includes('warn')) return <AlertCircle className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
}

function notifColor(type: string) {
  if (type.includes('book')) return 'bg-blue-100 text-blue-600';
  if (type.includes('result') || type.includes('win')) return 'bg-amber-100 text-amber-600';
  if (type.includes('alert') || type.includes('warn')) return 'bg-rose-100 text-rose-600';
  return 'bg-violet-100 text-violet-600';
}

function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await api.get('/agent/notifications');
      setNotifications(res.data.data ?? []);
      setUnread(res.data.unread_count ?? 0);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function markOne(id: number) {
    try {
      await api.post('/agent/notifications/read', { id });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
      setUnread((c) => Math.max(0, c - 1));
    } catch {}
  }

  async function markAll() {
    try {
      await api.post('/agent/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch {}
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-blue-600"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Notifications</p>
              {unread > 0 && <p className="text-[11px] text-slate-400">{unread} unread</p>}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAll}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50"
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-400 hover:text-slate-600">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <ul className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <li className="px-4 py-8 text-center text-xs text-slate-400">Loading...</li>
            ) : notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-xs text-slate-400">No notifications</li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${
                    !n.is_read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notifColor(n.type)}`}>
                    {notifIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[12.5px] font-bold leading-tight ${
                        !n.is_read ? 'text-slate-900' : 'text-slate-600'
                      }`}>{n.title}</p>
                      {!n.is_read && (
                        <button
                          onClick={() => markOne(n.id)}
                          title="Mark as read"
                          className="shrink-0 rounded p-0.5 text-blue-400 hover:text-blue-600"
                        >
                          <Check size={13} />
                        </button>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{n.message}</p>
                    <p className="mt-1 text-[10.5px] font-medium text-slate-400">{n.time}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

const navigation = [
  { name: 'Dashboard', href: '/agent/dashboard', icon: LayoutDashboard },
  { name: 'My Games', href: '/agent/games', icon: Gamepad2 },
  { name: 'My Books', href: '/agent/books', icon: BookOpen },
  { name: 'Assignment History', href: '/agent/assignment-history', icon: History },
  { name: 'Reports', href: '/agent/reports', icon: BarChart2 },
  { name: 'Profile', href: '/agent/profile', icon: User },
];

const pageTitle: Record<string, string> = {
  dashboard: 'Dashboard',
  games: 'My Games',
  books: 'My Books',
  'ticker-search': 'Ticker Search',
  sales: 'Sales',
  'sold-books': 'Sold Books',
  'unsold-books': 'Unsold Books',
  'assignment-history': 'Assignment History',
  results: 'Results',
  'result-search': 'Result Search',
  reports: 'Reports',
  profile: 'Profile',
};

function SidebarContent({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="relative flex h-full flex-col overflow-hidden text-white">
      <div className="absolute inset-0 bg-[#080827]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(98,78,255,0.45),transparent_34%),linear-gradient(180deg,rgba(12,15,58,0.95),rgba(6,8,38,0.88))]" />


      {/* Logo */}
      <div className="relative flex items-center justify-between px-3" style={{ minHeight: '64px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/30">
            <Crown className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-lg font-black leading-tight text-white">Lucky Draw</p>
              <p className="text-xs font-medium text-slate-300">Agent Panel</p>
            </div>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="relative rounded-md p-1 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="relative flex-1 overflow-y-auto px-2.5 pt-5 pb-3 flex flex-col justify-between">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={onClose}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center rounded-lg px-4 py-4 text-[13.5px] transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-violet-600 font-bold text-white shadow-xl shadow-blue-950/30'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className={`h-6 w-6 shrink-0 ${isActive ? 'text-white' : 'text-slate-200'}`} />
                  {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout card */}
      <div className="relative p-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          {!collapsed && (
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-rose-300">
                <LogOut className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-white">Need Help?</p>
                <p className="text-[10px] text-slate-400">Contact support</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-500/20 px-3 py-2 text-[12px] font-bold text-rose-300 transition-colors hover:bg-rose-500/30 hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AgentProfile { agent_name: string; agent_id: string; profile_photo_url: string | null; }

const AGENT_PHOTO_UPDATED_EVENT = 'agent-profile-photo-updated';

export default function MainLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);

  useEffect(() => {
    api.get('/agent/profile').then((res) => setAgentProfile(res.data.data ?? res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    function handlePhotoUpdate(event: Event) {
      const photoUrl = (event as CustomEvent<{ profile_photo_url?: string }>).detail?.profile_photo_url;
      if (!photoUrl) return;
      setAgentProfile((profile) => profile ? { ...profile, profile_photo_url: photoUrl } : profile);
    }

    window.addEventListener(AGENT_PHOTO_UPDATED_EVENT, handlePhotoUpdate);
    return () => window.removeEventListener(AGENT_PHOTO_UPDATED_EVENT, handlePhotoUpdate);
  }, []);

  const currentPage = location.pathname.split('/').pop() || '';
  const title = pageTitle[currentPage] || currentPage;

  return (
    <div className="flex h-screen bg-[#f5f7fb]">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 w-64 shrink-0">
            <SidebarContent collapsed={false} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex shrink-0 flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent collapsed={collapsed} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden text-slate-800 min-w-0">
        <header
          className="flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-3 shadow-sm backdrop-blur sm:px-5"
          style={{ minHeight: '64px', flexShrink: 0 }}
        >
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-600 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Desktop collapse button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-600 lg:block"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate text-lg font-black text-slate-950 sm:text-xl">{title}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex">
              <Calendar size={16} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-700 lg:text-sm">
                {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <NotificationPanel />
            <div className="flex items-center gap-2">
              {agentProfile?.profile_photo_url
                ? <img src={agentProfile.profile_photo_url} alt={agentProfile.agent_name} className="h-9 w-9 rounded-full border-2 border-blue-100 object-cover" />
                : <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-blue-100 bg-blue-50 text-blue-500"><User size={18} /></div>
              }
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold text-slate-900">{agentProfile?.agent_name ?? '—'}</p>
                <p className="text-xs font-medium text-slate-500">ID: {agentProfile?.agent_id ?? '—'}</p>
              </div>
              <ChevronDown size={16} className="hidden cursor-pointer text-slate-400 sm:block" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 pt-5 sm:p-4 sm:pt-6 lg:p-5 lg:pt-7">
          <div className="mx-auto max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
