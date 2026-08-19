import { useEffect, useRef, useState } from 'react';
import { Camera, Mail, MapPin, Phone, Save, MessageCircle, User, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';

interface ProfileData {
  agent_name: string;
  email: string;
  mobile_number: string;
  whatsapp_number: string;
  address: string;
  agent_id: string;
  agent_type: string;
  status: string;
  profile_photo_url: string | null;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[10.5px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({ name: '', mobile: '', whatsapp: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/agent/profile').then((res) => {
      const d: ProfileData = res.data.data ?? res.data;
      setProfile(d);
      setForm({ name: d.agent_name, mobile: d.mobile_number, whatsapp: d.whatsapp_number, address: d.address });
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    try {
      await api.post('/agent/profile', form);
      setProfile((p) => p ? { ...p, agent_name: form.name, mobile_number: form.mobile, whatsapp_number: form.whatsapp, address: form.address } : p);
      setSaveMsg({ text: 'Profile updated successfully.', ok: true });
    } catch {
      setSaveMsg({ text: 'Failed to update profile.', ok: false });
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(null), 3000);
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await api.post('/agent/profile/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile((p) => p ? { ...p, profile_photo_url: res.data.profile_photo_url } : p);
    } catch {}
    setPhotoUploading(false);
    e.target.value = '';
  }

  return (
    <div className="space-y-4">
      {/* Page heading */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">Lucky Draw Agent Panel</p>
        <h1 className="mt-1 text-xl font-black text-slate-950">Profile</h1>
        <p className="mt-0.5 text-xs text-slate-500">Manage your agent identity and contact details.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">

        {/* ── Left card ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
          {/* Hero banner */}
          <div className="relative h-28 bg-[radial-gradient(circle_at_70%_0%,rgba(98,78,255,0.55),transparent_60%),linear-gradient(135deg,#0f172a,#1e3a8a)]">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center px-6 pb-6">
            <div className="relative -mt-12">
              {profile?.profile_photo_url
                ? <img src={profile.profile_photo_url} alt={profile.agent_name}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-xl" />
                : <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-violet-100 shadow-xl text-blue-500">
                    <User size={36} />
                  </div>
              }
              <button
                onClick={() => fileRef.current?.click()}
                disabled={photoUploading}
                className="absolute bottom-0.5 right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg ring-2 ring-white hover:opacity-90 disabled:opacity-60 transition"
              >
                <Camera size={13} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>

            {photoUploading && <p className="mt-2 text-[11px] font-medium text-blue-500">Uploading...</p>}

            <h2 className="mt-3 text-lg font-black text-slate-900">{profile?.agent_name ?? '—'}</h2>

            <div className="mt-1 flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1">
              <ShieldCheck size={12} className="text-blue-500" />
              <span className="text-[11px] font-bold text-blue-600">{profile?.agent_id ?? '—'}</span>
            </div>

            {profile?.status && (
              <span className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ring-1 ${
                profile.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-50 text-slate-500 ring-slate-200'
              }`}>
                {profile.status}
              </span>
            )}

            {/* Info rows */}
            <div className="mt-5 w-full space-y-2">
              {[
                { icon: <Mail size={14} className="text-blue-500" />, val: profile?.email },
                { icon: <Phone size={14} className="text-emerald-500" />, val: profile?.mobile_number },
                { icon: <MessageCircle size={14} className="text-green-500" />, val: profile?.whatsapp_number },
                { icon: <MapPin size={14} className="text-rose-400" />, val: profile?.address },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
                  <span className="mt-0.5 shrink-0">{row.icon}</span>
                  <span className="text-[12px] leading-relaxed text-slate-600">{row.val || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right card ── */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
          {/* Card header */}
          <div className="border-b border-slate-100 px-6 py-4">
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-blue-500">Edit Details</p>
            <h3 className="mt-0.5 text-base font-black text-slate-900">Update Profile</h3>
          </div>

          <div className="p-6 space-y-5">
            {/* Read-only info strip */}
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <Field label="Agent ID" value={profile?.agent_id ?? ''} />
              <Field label="Agent Type" value={profile?.agent_type ?? ''} />
              <Field label="Email" value={profile?.email ?? ''} />
              <Field label="Status" value={profile?.status ?? ''} />
            </div>

            {/* Editable fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Full Name', key: 'name', val: form.name },
                { label: 'Mobile Number', key: 'mobile', val: form.mobile },
                { label: 'WhatsApp Number', key: 'whatsapp', val: form.whatsapp },
              ].map(({ label, key, val }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
                  <input
                    value={val}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-400">Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:opacity-90 disabled:opacity-60 transition"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {saveMsg && (
                <span className={`text-xs font-semibold ${saveMsg.ok ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {saveMsg.text}
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
