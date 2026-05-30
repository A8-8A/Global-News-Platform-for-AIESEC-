// Profile page — route "/profile/:id" (inside Layout).
//
// "/profile/me" resolves to the signed-in user and shows the edit UI.
// "/profile/:numericId" shows another user read-only.
//
// Fields shown:
//   - Profile photo (Firebase Storage upload for own profile)
//   - Full name
//   - Email
//   - Bio (editable for own profile, empty by default)
//   - MC / LC  (from EXPA: home_lc.parent.name / home_lc.name)
//   - Role title (current_positions[0].title or "Member")
//   - Country flag (derived from officeCode if present)
//
// Clicking an author's avatar / name anywhere in the app links here.

import { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { useProfile, useUpdateProfile } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { OfficeTag } from '../components/ui/OfficeTag';
import { Btn } from '../components/ui/Btn';
import { Field, Input } from '../components/ui/Field';
import { RuleLabel } from '../components/ui/RuleLabel';
import { Spinner } from '../components/ui/states';
import { ArrowIcon } from '../components/ui/Icon';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB for avatars
const ACCEPTED = 'image/jpeg,image/png,image/webp';

/* ── Country flag emoji from ISO code ─────────────────────────── */
function flagEmoji(code) {
  if (!code || code.length !== 2) return null;
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    ...upper.split('').map((c) => 0x1f1e0 - 65 + c.charCodeAt(0))
  );
}

/* ── Upload hook (same pattern as ComposePost) ─────────────────── */
function useAvatarUpload() {
  const [state, setState] = useState({ status: 'idle', progress: 0, url: '', error: null });
  const taskRef = useRef(null);

  function upload(file, userId) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setState((s) => ({ ...s, status: 'error', error: 'Max 5 MB.' }));
      return;
    }
    const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `avatars/${userId}-${Date.now()}-${safe}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
    taskRef.current = task;
    setState({ status: 'uploading', progress: 0, url: '', error: null });

    task.on(
      'state_changed',
      (snap) => setState((s) => ({ ...s, progress: Math.round((snap.bytesTransferred / snap.totalBytes) * 100) })),
      (err) => setState((s) => ({ ...s, status: 'error', error: err.message })),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setState((s) => ({ ...s, status: 'done', url }));
      }
    );
  }

  function reset() {
    taskRef.current?.cancel();
    setState({ status: 'idle', progress: 0, url: '', error: null });
  }

  return { ...state, upload, reset };
}

/* ── Info row (label + value) ──────────────────────────────────── */
function InfoRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
      <span className="font-mono uppercase text-ink-faint" style={{ fontSize: 10, letterSpacing: '0.16em' }}>{label}</span>
      <div className="font-sans text-ink" style={{ fontSize: 15 }}>{children}</div>
    </div>
  );
}

/* ── Photo upload widget ───────────────────────────────────────── */
function AvatarUploader({ currentSrc, name, userId, onUploaded }) {
  const uploader = useAvatarUpload();
  const fileInputRef = useRef(null);

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploader.upload(file, userId);
    e.target.value = '';
  }

  // Once upload finishes, bubble the URL up immediately so the parent
  // can persist it to the backend.
  if (uploader.status === 'done' && uploader.url) {
    onUploaded(uploader.url);
    uploader.reset();
  }

  const displaySrc = uploader.status === 'uploading' ? currentSrc : (uploader.url || currentSrc);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar name={name} src={displaySrc} size={120} />
        {uploader.status === 'uploading' && (
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)' }}
          >
            <div className="flex flex-col items-center gap-1">
              <Spinner />
              <span className="font-mono text-white" style={{ fontSize: 10 }}>{uploader.progress}%</span>
            </div>
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept={ACCEPTED} className="hidden" onChange={onFileChange} />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploader.status === 'uploading'}
        className="font-sans font-bold text-accent-deep underline disabled:opacity-50"
        style={{ fontSize: 12, textUnderlineOffset: 3 }}
      >
        {uploader.status === 'uploading' ? `Uploading ${uploader.progress}%…` : 'Change photo'}
      </button>
      {uploader.error && (
        <span className="font-sans" style={{ fontSize: 11, color: 'var(--danger)' }}>{uploader.error}</span>
      )}
      <span className="font-sans text-ink-faint text-center" style={{ fontSize: 11 }}>
        JPEG, PNG or WebP · max 5 MB<br />Stored in Firebase Storage
      </span>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { id } = useParams();           // "me" or a numeric user id
  const { user: me, loading: authLoading, completeLogin } = useAuth();
  const navigate = useNavigate();

  // Resolve "me" to the real user id so the query key is stable.
  const resolvedId = id === 'me' ? me?.id : id;
  const isOwnProfile = id === 'me' || (me && String(me.id) === String(id));

  const { data, isLoading, isError, refetch } = useProfile(resolvedId, isOwnProfile);
  const updateProfile = useUpdateProfile();

  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [toast, setToast] = useState(null);

  // While auth is still resolving for "/profile/me", show the spinner
  // rather than the error or sign-in states - the id will resolve shortly.
  if (id === 'me' && authLoading) return (
    <div className="mx-auto max-w-article px-10 py-20 flex items-center gap-3 text-ink-soft">
      <Spinner /> Resolving your profile…
    </div>
  );

  // Require login to view own profile.
  if (id === 'me' && !me) {
    return (
      <div className="mx-auto max-w-article px-10 py-20 flex flex-col items-center gap-5 text-center">
        <h1 className="display" style={{ fontSize: 40, color: 'var(--ink)' }}>
          Sign in to view your <span className="display-italic" style={{ color: 'var(--accent)' }}>profile.</span>
        </h1>
        <Btn variant="primary" trailing={<ArrowIcon />} onClick={() => navigate('/login')}>
          Sign in with AIESEC EXPA
        </Btn>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-article px-10 py-20 flex items-center gap-3 text-ink-soft">
        <Spinner /> Loading profile…
      </div>
    );
  }

  if (isError || !data) {
    // Surface the actual error so it's visible without DevTools
    const errMsg = isError?.message || (typeof isError === 'object' ? JSON.stringify(isError) : String(isError ?? ''));
    return (
      <div className="mx-auto max-w-article px-10 py-20 flex flex-col gap-4">
        <h1 className="display" style={{ fontSize: 36, color: 'var(--ink)' }}>
          Couldn't load this <span className="display-italic" style={{ color: 'var(--danger)' }}>profile.</span>
        </h1>
        {errMsg && (
          <div className="font-mono text-ink-soft" style={{ fontSize: 12, padding: '12px 14px', background: 'var(--paper-soft)', borderRadius: 6, border: '1px solid var(--line)', wordBreak: 'break-all' }}>
            {errMsg}
          </div>
        )}
        <div className="font-sans text-ink-faint" style={{ fontSize: 12 }}>
          Endpoint: GET /api/auth/me (own profile) · resolved id: {String(resolvedId ?? 'undefined')}
        </div>
        <div className="flex gap-3">
          <Btn variant="primary" onClick={() => refetch()}>Try again</Btn>
          <Btn variant="outline" onClick={() => navigate('/feed')}>Back to the feed</Btn>
        </div>
      </div>
    );
  }

  // Normalise both response shapes:
  //   /api/auth/me  → { id, role, fullName, email, officeId, officeName, photoUrl, roleTitle }
  //   /api/users/id → { id, fullName, email, officeName, mcName, officeCode, roleTitle, bio, photoUrl }
  const profile = data.user ?? data;

  const fullName   = profile.fullName   || profile.full_name || 'AIESEC Member';
  const email      = profile.email      || '';
  const bio        = profile.bio        || '';
  const photoUrl   = profile.photoUrl   || profile.profile_photo || '';
  const officeCode = profile.officeCode || null;
  const lcName     = profile.lcName     || profile.officeName || profile.home_lc?.name || '';
  const mcName     = profile.mcName     || profile.home_lc?.parent?.name || '';
  const roleTitle  = profile.roleTitle  || profile.current_positions?.[0]?.title || 'Member';
  const flag       = flagEmoji(officeCode);

  function saveBio() {
    updateProfile.mutate(
      { id: resolvedId, bio: bioDraft },
      {
        onSuccess: () => {
          setEditingBio(false);
          setToast('Bio saved.');
          setTimeout(() => setToast(null), 2500);
          // Keep the AuthContext user object fresh if it's the own profile.
          if (isOwnProfile && me) completeLogin(localStorage.getItem('aiesec_news_token'), { ...me, bio: bioDraft });
        },
        onError: (e) => setToast(e.message || 'Could not save bio.'),
      }
    );
  }

  function onAvatarUploaded(url) {
    updateProfile.mutate(
      { id: resolvedId, photoUrl: url },
      {
        onSuccess: () => {
          setToast('Profile photo updated.');
          setTimeout(() => setToast(null), 2500);
          if (isOwnProfile && me) completeLogin(localStorage.getItem('aiesec_news_token'), { ...me, photoUrl: url });
          refetch();
        },
        onError: (e) => setToast(e.message || 'Could not save photo.'),
      }
    );
  }

  return (
    <div className="bg-paper">
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 z-50" style={{ top: 88 }}>
          <div
            className="font-sans font-bold text-white inline-flex items-center gap-2"
            style={{ padding: '12px 18px', borderRadius: 8, fontSize: 13, background: 'var(--ink)', boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}
          >
            {toast}
          </div>
        </div>
      )}

      {/* Page header band */}
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
          <Link to="/feed" className="font-sans font-bold text-ink-soft" style={{ fontSize: 13, marginBottom: 4 }}>
            ← Feed
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[900px] px-10 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-14">

        {/* Left col — avatar + upload */}
        <aside className="flex flex-col gap-6 items-center lg:items-start lg:sticky lg:top-24 self-start">
          {isOwnProfile ? (
            <AvatarUploader
              currentSrc={photoUrl}
              name={fullName}
              userId={resolvedId}
              onUploaded={onAvatarUploaded}
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Avatar name={fullName} src={photoUrl || undefined} size={120} />
              {flag && officeCode && (
                <div className="flex items-center gap-1.5 font-sans font-bold text-ink-soft" style={{ fontSize: 13 }}>
                  <span style={{ fontSize: 22 }}>{flag}</span>
                  <span>{officeCode}</span>
                </div>
              )}
            </div>
          )}

          {/* Role badge */}
          <div
            className="self-stretch flex flex-col gap-2"
            style={{ padding: '16px 18px', borderRadius: 8, background: 'var(--accent-tint)', border: '1px solid var(--accent-light)' }}
          >
            <span className="font-mono uppercase text-accent-deep" style={{ fontSize: 10, letterSpacing: '0.18em' }}>Current role</span>
            <span className="font-sans font-bold text-ink" style={{ fontSize: 14 }}>{roleTitle}</span>
            {officeCode && <OfficeTag code={officeCode} mode="chip" />}
          </div>
        </aside>

        {/* Right col — info */}
        <main className="flex flex-col">
          <RuleLabel right={isOwnProfile ? 'editable' : 'read-only'}>Identity</RuleLabel>

          <InfoRow label="Full name">
            <span className="font-bold">{fullName}</span>
            {flag && <span className="ml-2" style={{ fontSize: 20 }}>{flag}</span>}
          </InfoRow>

          <InfoRow label="Email">
            <a href={`mailto:${email}`} className="text-accent-deep underline" style={{ textUnderlineOffset: 3 }}>
              {email || <span className="text-ink-faint italic">not set</span>}
            </a>
          </InfoRow>

          {(mcName || lcName) && (
            <InfoRow label="Entity">
              <div className="flex flex-col gap-0.5">
                {mcName && <span className="font-bold text-ink">{mcName}</span>}
                {lcName && <span className="text-ink-soft" style={{ fontSize: 13 }}>{lcName}</span>}
              </div>
            </InfoRow>
          )}

          {/* Bio */}
          <div className="flex flex-col gap-3 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono uppercase text-ink-faint" style={{ fontSize: 10, letterSpacing: '0.16em' }}>Bio</span>
              {isOwnProfile && !editingBio && (
                <button
                  type="button"
                  onClick={() => { setBioDraft(bio); setEditingBio(true); }}
                  className="font-sans font-bold text-accent-deep underline"
                  style={{ fontSize: 12, textUnderlineOffset: 3 }}
                >
                  {bio ? 'Edit' : '+ Add bio'}
                </button>
              )}
            </div>

            {editingBio ? (
              <div className="flex flex-col gap-3">
                <Field>
                  <Input
                    multiline
                    rows={4}
                    value={bioDraft}
                    onChange={(e) => setBioDraft(e.target.value)}
                    placeholder="A sentence or two about you and your entity."
                    style={{ fontSize: 15 }}
                  />
                </Field>
                <div className="flex gap-2">
                  <Btn variant="primary" size="sm" onClick={saveBio} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? 'Saving…' : 'Save bio'}
                  </Btn>
                  <Btn variant="outline" size="sm" onClick={() => setEditingBio(false)}>Cancel</Btn>
                </div>
              </div>
            ) : (
              <p className="font-sans" style={{ fontSize: 15, lineHeight: 1.65, color: bio ? 'var(--ink)' : 'var(--ink-faint)', fontStyle: bio ? 'normal' : 'italic' }}>
                {bio || (isOwnProfile ? 'No bio yet — add one above.' : 'This member hasn\'t written a bio yet.')}
              </p>
            )}
          </div>

          {/* Divider before posts */}
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
