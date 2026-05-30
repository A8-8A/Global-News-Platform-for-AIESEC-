// Profile page — /profile/me (own) or /profile/:id (other users).
// Own profile: renders directly from AuthContext me — NO API call needed.
// Other profiles: calls GET /api/users/:id.

import { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { useUpdateProfile } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { OfficeTag } from '../components/ui/OfficeTag';
import { Btn } from '../components/ui/Btn';
import { Field, Input } from '../components/ui/Field';
import { RuleLabel } from '../components/ui/RuleLabel';
import { Spinner } from '../components/ui/states';
import { ArrowIcon } from '../components/ui/Icon';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED = 'image/jpeg,image/png,image/webp';

function flagEmoji(code) {
  if (!code || code.length !== 2) return null;
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 0x1f1e0 - 65 + c.charCodeAt(0))
  );
}

function useAvatarUpload() {
  const [state, setState] = useState({ status: 'idle', progress: 0, url: '', error: null });
  const taskRef = useRef(null);
  function upload(file, userId) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) { setState(s => ({ ...s, status: 'error', error: 'Max 5 MB.' })); return; }
    const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const storageRef = ref(storage, `avatars/${userId}-${Date.now()}-${safe}`);
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
    taskRef.current = task;
    setState({ status: 'uploading', progress: 0, url: '', error: null });
    task.on('state_changed',
      snap => setState(s => ({ ...s, progress: Math.round((snap.bytesTransferred / snap.totalBytes) * 100) })),
      err => setState(s => ({ ...s, status: 'error', error: err.message })),
      async () => { const url = await getDownloadURL(task.snapshot.ref); setState(s => ({ ...s, status: 'done', url })); }
    );
  }
  function reset() { taskRef.current?.cancel(); setState({ status: 'idle', progress: 0, url: '', error: null }); }
  return { ...state, upload, reset };
}

function InfoRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
      <span className="font-mono uppercase text-ink-faint" style={{ fontSize: 10, letterSpacing: '0.16em' }}>{label}</span>
      <div className="font-sans text-ink" style={{ fontSize: 15 }}>{children}</div>
    </div>
  );
}

function AvatarUploader({ currentSrc, name, userId, onUploaded }) {
  const uploader = useAvatarUpload();
  const fileInputRef = useRef(null);
  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploader.upload(file, userId);
    e.target.value = '';
  }
  if (uploader.status === 'done' && uploader.url) { onUploaded(uploader.url); uploader.reset(); }
  const displaySrc = uploader.status === 'uploading' ? currentSrc : (uploader.url || currentSrc);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar name={name} src={displaySrc} size={120} />
        {uploader.status === 'uploading' && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <div className="flex flex-col items-center gap-1"><Spinner /><span className="font-mono text-white" style={{ fontSize: 10 }}>{uploader.progress}%</span></div>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept={ACCEPTED} className="hidden" onChange={onFileChange} />
      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploader.status === 'uploading'}
        className="font-sans font-bold text-accent-deep underline disabled:opacity-50" style={{ fontSize: 12, textUnderlineOffset: 3 }}>
        {uploader.status === 'uploading' ? `Uploading ${uploader.progress}%…` : 'Change photo'}
      </button>
      {uploader.error && <span className="font-sans" style={{ fontSize: 11, color: 'var(--danger)' }}>{uploader.error}</span>}
      <span className="font-sans text-ink-faint text-center" style={{ fontSize: 11 }}>JPEG, PNG or WebP · max 5 MB</span>
    </div>
  );
}

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me, loading: authLoading, completeLogin } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  const isOwnProfile = id === 'me';
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [toast, setToast] = useState(null);

  // Auth still loading
  if (authLoading) return (
    <div className="mx-auto max-w-article px-10 py-20 flex items-center gap-3 text-ink-soft">
      <Spinner /> Loading…
    </div>
  );

  // Own profile but not logged in
  if (isOwnProfile && !me) return (
    <div className="mx-auto max-w-article px-10 py-20 flex flex-col items-center gap-5 text-center">
      <h1 className="display" style={{ fontSize: 40, color: 'var(--ink)' }}>
        Sign in to view your <span className="display-italic" style={{ color: 'var(--accent)' }}>profile.</span>
      </h1>
      <Btn variant="primary" trailing={<ArrowIcon />} onClick={() => navigate('/login')}>Sign in with AIESEC EXPA</Btn>
    </div>
  );

  // For own profile, use `me` directly — no API call needed.
  // me = { id, role, fullName, email, officeId, officeName, photoUrl, roleTitle }
  const profile = isOwnProfile ? me : null; // TODO: other profiles need /api/users/:id

  if (!profile) return (
    <div className="mx-auto max-w-article px-10 py-20 flex flex-col items-center gap-5 text-center">
      <h1 className="display" style={{ fontSize: 36, color: 'var(--ink)' }}>
        Profile not available.
      </h1>
      <Btn variant="outline" onClick={() => navigate('/feed')}>Back to the feed</Btn>
    </div>
  );

  const fullName   = profile.fullName || profile.full_name || profile.name || 'AIESEC Member';
  const email      = profile.email || '';
  const bio        = profile.bio || '';
  const photoUrl   = profile.photoUrl || '';
  const officeCode = profile.officeCode || null;
  const lcName     = profile.lcName || profile.officeName || '';
  const mcName     = profile.mcName || '';
  const roleTitle  = profile.roleTitle || 'Member';
  const flag       = flagEmoji(officeCode);
  const userId     = profile.id;

  function saveBio() {
    if (!userId) return;
    updateProfile.mutate(
      { id: userId, bio: bioDraft },
      {
        onSuccess: () => {
          setEditingBio(false);
          setToast('Bio saved.');
          setTimeout(() => setToast(null), 2500);
          if (isOwnProfile && me) completeLogin(localStorage.getItem('aiesec_news_token'), { ...me, bio: bioDraft });
        },
        onError: (e) => setToast(e.message || 'Could not save bio.'),
      }
    );
  }

  function onAvatarUploaded(url) {
    if (!userId) return;
    updateProfile.mutate(
      { id: userId, photoUrl: url },
      {
        onSuccess: () => {
          setToast('Profile photo updated.');
          setTimeout(() => setToast(null), 2500);
          if (isOwnProfile && me) completeLogin(localStorage.getItem('aiesec_news_token'), { ...me, photoUrl: url });
        },
        onError: (e) => setToast(e.message || 'Could not save photo.'),
      }
    );
  }

  return (
    <div className="bg-paper">
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 z-50" style={{ top: 88 }}>
          <div className="font-sans font-bold text-white inline-flex items-center gap-2"
            style={{ padding: '12px 18px', borderRadius: 8, fontSize: 13, background: 'var(--ink)', boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}>
            {toast}
          </div>
        </div>
      )}

      <div className="bg-paper border-b border-line">
        <div className="mx-auto max-w-[900px] px-10 pt-10 pb-8 flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">{isOwnProfile ? 'Your profile' : 'Member profile'}</span>
            <h1 className="display mt-3" style={{ fontSize: 42, color: 'var(--ink)', lineHeight: 1.04 }}>
              {isOwnProfile
                ? <>The desk, <span className="display-italic" style={{ color: 'var(--accent)' }}>you.</span></>
                : fullName}
            </h1>
          </div>
          <Link to="/feed" className="font-sans font-bold text-ink-soft" style={{ fontSize: 13, marginBottom: 4 }}>← Feed</Link>
        </div>
      </div>

      <div className="mx-auto max-w-[900px] px-10 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-14">
        <aside className="flex flex-col gap-6 items-center lg:items-start lg:sticky lg:top-24 self-start">
          {isOwnProfile ? (
            <AvatarUploader currentSrc={photoUrl} name={fullName} userId={userId} onUploaded={onAvatarUploaded} />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Avatar name={fullName} src={photoUrl || undefined} size={120} />
              {flag && officeCode && (
                <div className="flex items-center gap-1.5 font-sans font-bold text-ink-soft" style={{ fontSize: 13 }}>
                  <span style={{ fontSize: 22 }}>{flag}</span><span>{officeCode}</span>
                </div>
              )}
            </div>
          )}
          <div className="self-stretch flex flex-col gap-2"
            style={{ padding: '16px 18px', borderRadius: 8, background: 'var(--accent-tint)', border: '1px solid var(--accent-light)' }}>
            <span className="font-mono uppercase text-accent-deep" style={{ fontSize: 10, letterSpacing: '0.18em' }}>Current role</span>
            <span className="font-sans font-bold text-ink" style={{ fontSize: 14 }}>{roleTitle}</span>
            {officeCode && <OfficeTag code={officeCode} mode="chip" />}
          </div>
        </aside>

        <main className="flex flex-col">
          <RuleLabel right={isOwnProfile ? 'editable' : 'read-only'}>Identity</RuleLabel>

          <InfoRow label="Full name">
            <span className="font-bold">{fullName}</span>
            {flag && <span className="ml-2" style={{ fontSize: 20 }}>{flag}</span>}
          </InfoRow>

          <InfoRow label="Email">
            {email ? (
              <a href={`mailto:${email}`} className="text-accent-deep underline" style={{ textUnderlineOffset: 3 }}>{email}</a>
            ) : (
              <span className="text-ink-faint italic">not available</span>
            )}
          </InfoRow>

          {(mcName || lcName) && (
            <InfoRow label="Entity">
              <div className="flex flex-col gap-0.5">
                {mcName && <span className="font-bold text-ink">{mcName}</span>}
                {lcName && <span className="text-ink-soft" style={{ fontSize: 13 }}>{lcName}</span>}
              </div>
            </InfoRow>
          )}

          <div className="flex flex-col gap-3 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono uppercase text-ink-faint" style={{ fontSize: 10, letterSpacing: '0.16em' }}>Bio</span>
              {isOwnProfile && !editingBio && (
                <button type="button" onClick={() => { setBioDraft(bio); setEditingBio(true); }}
                  className="font-sans font-bold text-accent-deep underline" style={{ fontSize: 12, textUnderlineOffset: 3 }}>
                  {bio ? 'Edit' : '+ Add bio'}
                </button>
              )}
            </div>
            {editingBio ? (
              <div className="flex flex-col gap-3">
                <Field><Input multiline rows={4} value={bioDraft} onChange={e => setBioDraft(e.target.value)}
                  placeholder="A sentence or two about you and your entity." style={{ fontSize: 15 }} /></Field>
                <div className="flex gap-2">
                  <Btn variant="primary" size="sm" onClick={saveBio} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? 'Saving…' : 'Save bio'}
                  </Btn>
                  <Btn variant="outline" size="sm" onClick={() => setEditingBio(false)}>Cancel</Btn>
                </div>
              </div>
            ) : (
              <p className="font-sans" style={{ fontSize: 15, lineHeight: 1.65, color: bio ? 'var(--ink)' : 'var(--ink-faint)', fontStyle: bio ? 'normal' : 'italic' }}>
                {bio || (isOwnProfile ? "No bio yet — add one above." : "This member hasn't written a bio yet.")}
              </p>
            )}
          </div>

          <div className="mt-8">
            <RuleLabel right="on the desk">Filed stories</RuleLabel>
            <p className="font-sans text-ink-faint mt-4" style={{ fontSize: 13 }}>
              Story history per author isn't implemented yet — check back soon.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
