import { useEffect, useRef, useState } from 'react';
import { Camera, Mail, MapPin, Phone, MessageCircle, User, ShieldCheck, Lock, Sparkles, BadgeCheck, Crown, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { PageLoader, ErrorBar } from '../PremiumPage';

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

const AGENT_PHOTO_UPDATED_EVENT = 'agent-profile-photo-updated';
const MAX_PHOTO_SIZE = 2048 * 1024;

function cacheBustUrl(url: string) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${Date.now()}`;
}

function getPhotoUrl(data: any): string | null {
  const payload = data?.data ?? data;
  return payload?.profile_photo_url
    ?? payload?.agent?.profile_photo_url
    ?? payload?.profile?.profile_photo_url
    ?? payload?.photo_url
    ?? payload?.url
    ?? null;
}

function getApiMessage(data: any, fallback: string) {
  return data?.errors?.profile_photo?.[0]
    ?? data?.message
    ?? data?.data?.message
    ?? fallback;
}

function Field({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-md hover:shadow-blue-100/60 hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm ring-1 ring-slate-100 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600 group-hover:shadow-blue-200">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-blue-500">
            {label} <Lock size={8} className="opacity-40" />
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">{value || '—'}</p>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [avatarHover, setAvatarHover] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/agent/profile')
      .then((res) => setProfile(res.data.data ?? res.data))
      .catch(() => setPageError('Failed to load profile.'))
      .finally(() => setPageLoading(false));
  }, []);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadMsg({ text: 'Please select an image file.', ok: false });
      e.target.value = '';
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setUploadMsg({ text: 'Profile photo must not be greater than 2048 kilobytes.', ok: false });
      e.target.value = '';
      return;
    }

    setPhotoUploading(true);
    setUploadMsg(null);
    try {
      const fd = new FormData();
      fd.append('profile_photo', file);
      const res = await api.post('/agent/profile/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      let photoUrl = getPhotoUrl(res.data);
      if (!photoUrl) {
        const profileRes = await api.get('/agent/profile');
        const nextProfile: ProfileData = profileRes.data.data ?? profileRes.data;
        setProfile(nextProfile);
        photoUrl = nextProfile.profile_photo_url;
      }
      if (!photoUrl) throw new Error('Photo URL missing after update.');
      const nextPhotoUrl = cacheBustUrl(photoUrl);
      setProfile((p) => p ? { ...p, profile_photo_url: nextPhotoUrl } : p);
      window.dispatchEvent(new CustomEvent(AGENT_PHOTO_UPDATED_EVENT, {
        detail: { profile_photo_url: nextPhotoUrl },
      }));
      setUploadMsg({ text: getApiMessage(res.data, 'Photo updated!'), ok: true });
    } catch (err: any) {
      setUploadMsg({ text: getApiMessage(err?.response?.data, 'Upload failed.'), ok: false });
    } finally {
      setPhotoUploading(false);
      e.target.value = '';
      setTimeout(() => setUploadMsg(null), 6000);
    }
  }

  return (
    <>
      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
        .fade-up { animation: fade-up 0.45s ease both; }
      `}</style>

      {/* Page title */}
      <div className="fade-up mb-5">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-blue-600">Agent Portal</p>
        <h1 className="mt-0.5 text-xl font-black text-slate-900">My Profile</h1>
        <p className="mt-0.5 text-xs text-slate-400">Profile details are managed by admin. You can update your photo.</p>
      </div>
      {pageError && <ErrorBar message={pageError} />}
      {pageLoading ? <PageLoader /> : (
      <div
        className="fade-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
        style={{ animationDelay: '60ms' }}
      >
        <div className="flex flex-col lg:flex-row">

          {/* ── Left: Avatar section ── */}
          <div className="relative flex flex-col items-center overflow-hidden border-b border-slate-100 px-8 py-10 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
            {/* subtle gradient bg */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-violet-50/40" />
            {/* dot pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{ backgroundImage: 'radial-gradient(circle, #1e40af 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

            {/* Crown */}
            <div className="relative mb-5 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-200">
              <Crown size={16} className="text-amber-500" />
            </div>

            {/* Avatar */}
            <div
              className="relative cursor-pointer"
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              onClick={() => !photoUploading && fileRef.current?.click()}
            >
              {/* spinning ring */}
              <div
                className="absolute -inset-1.5 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)',
                  animation: 'spin-slow 5s linear infinite',
                  opacity: avatarHover ? 0.9 : 0.45,
                  transition: 'opacity 0.3s',
                }}
              />
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-[3px] border-white shadow-lg">
                {profile?.profile_photo_url
                  ? <img src={profile.profile_photo_url} alt={profile.agent_name} className="h-full w-full object-cover" />
                  : <div className="flex h-full w-full items-center justify-center bg-blue-50">
                      <User size={30} className="text-blue-400" />
                    </div>
                }
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1 transition-all duration-300"
                  style={{ background: avatarHover ? 'rgba(15,23,42,0.45)' : 'transparent', opacity: avatarHover ? 1 : 0 }}
                >
                  <Camera size={17} className="text-white" />
                  <span className="text-[9px] font-bold text-white">Change</span>
                </div>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={photoUploading} />

            {photoUploading && <p className="mt-2 text-[11px] font-semibold text-blue-500 animate-pulse">Uploading...</p>}
            {uploadMsg && (
              <div className={`relative mt-4 flex w-full items-start gap-2 rounded-lg border px-3 py-2.5 text-left shadow-sm ${
                uploadMsg.ok
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}>
                {uploadMsg.ok
                  ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                  : <AlertCircle size={15} className="mt-0.5 shrink-0" />}
                <p className="text-xs font-bold leading-relaxed">{uploadMsg.text}</p>
              </div>
            )}

            <h2 className="relative mt-4 text-center text-base font-black text-slate-900">{profile?.agent_name ?? '—'}</h2>

            {/* Agent ID */}
            <div className="relative mt-2 flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 ring-1 ring-blue-100 transition-all duration-300 hover:bg-blue-100 hover:ring-blue-300">
              <ShieldCheck size={11} className="text-blue-500" />
              <span className="text-[11px] font-black text-blue-600">{profile?.agent_id ?? '—'}</span>
            </div>

            {/* Status */}
            {profile?.status && (
              <div className={`relative mt-2 flex items-center gap-1.5 rounded-full px-3 py-1 ring-1 transition-all duration-300 hover:scale-105 ${
                profile.status === 'active'
                  ? 'bg-emerald-50 ring-emerald-100 hover:bg-emerald-100'
                  : 'bg-slate-50 ring-slate-200'
              }`}>
                <BadgeCheck size={11} className={profile.status === 'active' ? 'text-emerald-500' : 'text-slate-400'} />
                <span className={`text-[10px] font-black uppercase tracking-wide ${profile.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {profile.status}
                </span>
              </div>
            )}

            {/* Agent type */}
            {profile?.agent_type && (
              <div className="relative mt-2 flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 ring-1 ring-violet-100 transition-all duration-300 hover:bg-violet-100">
                <Sparkles size={10} className="text-violet-500" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-violet-600">{profile.agent_type}</span>
              </div>
            )}

            <p className="relative mt-6 text-center text-[10px] leading-relaxed text-slate-400">
              Click avatar to <span className="font-semibold text-blue-500">update photo</span>
            </p>
          </div>

          {/* ── Right: Fields ── */}
          <div className="flex-1 p-6 sm:p-8">
            {/* Section header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">Profile Information</p>
                <h3 className="mt-0.5 text-base font-black text-slate-900">Account Details</h3>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
                <User size={16} className="text-blue-500" />
              </div>
            </div>

            {/* Admin notice */}
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
              <Lock size={13} className="shrink-0 text-amber-500" />
              <p className="text-xs text-slate-500">
                Fields are <span className="font-semibold text-amber-600">read-only</span>. Contact your{' '}
                <span className="font-semibold text-amber-600">Admin</span> to update this information.
              </p>
            </div>

            {/* Fields */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full Name" value={profile?.agent_name ?? ''} icon={<User size={14} />} />
              <Field label="Agent ID" value={profile?.agent_id ?? ''} icon={<ShieldCheck size={14} />} />
              <Field label="Agent Type" value={profile?.agent_type ?? ''} icon={<Sparkles size={14} />} />
              <Field label="Status" value={profile?.status ?? ''} icon={<BadgeCheck size={14} />} />
              <Field label="Email Address" value={profile?.email ?? ''} icon={<Mail size={14} />} />
              <Field label="Mobile Number" value={profile?.mobile_number ?? ''} icon={<Phone size={14} />} />
              <Field label="WhatsApp" value={profile?.whatsapp_number ?? ''} icon={<MessageCircle size={14} />} />
              <Field label="Address" value={profile?.address ?? ''} icon={<MapPin size={14} />} />
            </div>
          </div>

        </div>
      </div>
      )}
    </>
  );
}
