// Profile page — /profile/:id
// :id = "me" → own profile (editable), reads from AuthContext + /api/users/:id
// :id = numeric → other user's profile (read-only), reads from /api/users/:id

import { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { useUpdateProfile, useMyPosts } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { Btn } from '../components/ui/Btn';
import { Field, Input } from '../components/ui/Field';
import { Spinner } from '../components/ui/states';
import { ArrowIcon, HeartIcon, CommentIcon } from '../components/ui/Icon';
import { timeAgo } from '../components/ui/states';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function flagEmoji(code) {
  if (!code || code.length !== 2) return null;
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 0x1f1e0 - 65 + c.charCodeAt(0))
  );
}

/* ── Avatar uploader ─────────────────────────────────────────────── */
function AvatarUploader({ src, name, userId, onUploaded }) {
  const [status, setStatus]     = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError]       = useState(null);
  const fileRef = useRef(null);

  function pick() { fileRef.current?.click(); }

  function onChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) { setError('Max 5 MB.'); return; }
    const path = `avatars/${userId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });
    setStatus('uploading'); setError(null);
    task.on('state_changed',
      s => setProgress(Math.round(s.bytesTransferred / s.totalBytes * 100)),
      err => { setStatus('idle'); setError(err.message); },
      async () => { onUploaded(await getDownloadURL(task.snapshot.ref)); setStatus('idle'); }
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={pick}
        title="Click to change photo"
        className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Avatar name={name} src={src || undefined} size={112} />
        {/* hover overlay */}
        <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.42)' }}>
          {status === 'uploading'
            ? <span className="font-mono text-white" style={{ fontSize: 11 }}>{progress}%</span>
            : <span className="font-sans font-bold text-white" style={{ fontSize: 12 }}>Change</span>
          }
        </div>
      </button>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onChange} />
      {error && <span className="font-sans text-center" style={{ fontSize: 11, color: 'var(--danger)' }}>{error}</span>}
      <span className="font-sans text-ink-faint text-center" style={{ fontSize: 11, lineHeight: 1.4 }}>
        Click to change · JPEG PNG WebP · max 5 MB
      </span>
    </div>
  );
}

/* ── Activity post card ──────────────────────────────────────────── */
function ActivityPost({ post }) {
  const status = post.status || 'APPROVED';
  const statusColor = status === 'APPROVED' ? 'var(--success)' : status === 'PENDING' ? 'var(--warn)' : 'var(--danger)';
  return (
    <Link
      to={status === 'APPROVED' ? `/feed/${post.id}` : '#'}
      className="flex flex-col gap-2 no-underline group"
      style={{ padding: '16px 0', borderBottom: '1px solid var(--line)' }}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold" style={{ fontSize: 9, letterSpacing: '0.14em', color: statusColor, padding: '2px 6px', borderRadius: 3, background: statusColor + '18', border: `1px solid ${statusColor}40` }}>
          {status}
        </span>
        <span className="font-mono text-ink-faint" style={{ fontSize: 10 }}>{timeAgo(post.createdAt)}</span>
      </div>
      <h4 className="font-display font-bold group-hover:text-accent-deep transition-colors" style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.25, margin: 0 }}>
        {post.title}
      </h4>
      {post.excerpt && (
        <p className="font-sans text-ink-soft" style={{ fontSize: 13, lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.excerpt}
        </p>
      )}
      <div className="flex items-center gap-4 font-sans text-ink-faint" style={{ fontSize: 12 }}>
        <span className="inline-flex items-center gap-1"><HeartIcon size={12} /> {post.likeCount ?? 0}</span>
        <span className="inline-flex items-center gap-1"><CommentIcon size={12} /> {post.commentCount ?? 0}</span>
      </div>
    </Link>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { id } = useParams();                    // "me" or numeric string
  const { user: me, loading: authLoading, completeLogin } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  const isOwnProfile = id === 'me';

  // Determine which user id to fetch for the full DB profile
  const fetchId = isOwnProfile ? me?.id : id;

  // Full profile from DB — has email, mcName, lcName, roleTitle, bio, photoUrl
  const { data: fullProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', 'full', fetchId],
    queryFn: () => api.get(`/api/users/${fetchId}`),
    enabled: !!fetchId,
    // Don't throw on error — we'll fall back to me object gracefully
    retry: 1,
  });

  // Own posts / activity (only fetched for own profile while logged in)
  const { data: postsData } = useMyPosts();
  const myPosts = isOwnProfile && postsData
    ? (Array.isArray(postsData) ? postsData : postsData?.posts ?? [])
    : [];

  // State
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft]     = useState('');
  const [toast, setToast]           = useState(null);

  /* ── Guards ───────────────────────────────────────────────── */
  if (authLoading) return (
    <div className="mx-auto max-w-article px-10 py-20 flex items-center gap-3 text-ink-soft">
      <Spinner /> Loading…
    </div>
  );

  if (isOwnProfile && !me) return (
    <div className="mx-auto max-w-article px-10 py-20 flex flex-col items-center gap-5 text-center">
      <h1 className="display" style={{ fontSize: 40, color: 'var(--ink)' }}>
        Sign in to view your <span className="display-italic" style={{ color: 'var(--accent)' }}>profile.</span>
      </h1>
      <Btn variant="primary" trailing={<ArrowIcon />} onClick={() => navigate('/login')}>
        Sign in with AIESEC EXPA
      </Btn>
    </div>
  );

  /* ── Merge data ────────────────────────────────────────────
     Priority: fullProfile (DB) > me (JWT) > fallback
     This way the page renders immediately from JWT, then enriches
     automatically when the DB profile arrives.              */
  const base = fullProfile ?? (isOwnProfile ? me : null);

  if (!base && !profileLoading) return (
    <div className="mx-auto max-w-article px-10 py-20 flex flex-col items-center gap-5 text-center">
      <h1 className="display" style={{ fontSize: 36, color: 'var(--ink)' }}>
        Couldn't load this profile.
      </h1>
      <Btn variant="outline" onClick={() => navigate('/feed')}>Back to the feed</Btn>
    </div>
  );

  if (!base) return (
    <div className="mx-auto max-w-article px-10 py-20 flex items-center gap-3 text-ink-soft">
      <Spinner /> Loading profile…
    </div>
  );

  // All display fields — fullProfile wins, JWT me fills gaps
  const fullName   = base.fullName   || me?.fullName  || 'AIESEC Member';
  const email      = base.email      || null;
  const bio        = base.bio        || '';
  const photoUrl   = base.photoUrl   || me?.photoUrl  || null;
  const officeCode = base.officeCode || null;
  const lcName     = base.lcName     || base.officeName || null;
  const mcName     = base.mcName     || null;
  const roleTitle  = base.roleTitle  || me?.roleTitle  || 'Member';
  const userId     = base.id         || me?.id;
  const flag       = flagEmoji(officeCode);

  /* ── Handlers ─────────────────────────────────────────────── */
  function saveBio() {
    if (!userId) return;
    updateProfile.mutate({ id: userId, bio: bioDraft }, {
      onSuccess: () => {
        setEditingBio(false);
        showToast('Bio saved.');
        if (isOwnProfile && me) completeLogin(localStorage.getItem('aiesec_news_token'), { ...me, bio: bioDraft });
      },
      onError: e => showToast(e.message || 'Could not save bio.'),
    });
  }

  function onPhotoUploaded(url) {
    if (!userId) return;
    updateProfile.mutate({ id: userId, photoUrl: url }, {
      onSuccess: () => {
        showToast('Profile photo updated.');
        if (isOwnProfile && me) completeLogin(localStorage.getItem('aiesec_news_token'), { ...me, photoUrl: url });
      },
      onError: e => showToast(e.message || 'Could not save photo.'),
    });
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div className="bg-paper min-h-full">
      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 z-50" style={{ top: 88 }}>
          <div className="font-sans font-bold text-white inline-flex items-center"
            style={{ padding: '12px 20px', borderRadius: 8, fontSize: 13, background: 'var(--ink)', boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}>
            {toast}
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="border-b border-line">
        <div className="mx-auto max-w-[900px] px-10 pt-10 pb-7 flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">{isOwnProfile ? 'Your profile' : 'Member profile'}</span>
            <h1 className="display mt-2.5" style={{ fontSize: 40, color: 'var(--ink)', lineHeight: 1.04 }}>
              {isOwnProfile
                ? <>The desk, <span className="display-italic" style={{ color: 'var(--accent)' }}>you.</span></>
                : fullName}
            </h1>
          </div>
          <Link to="/feed" className="font-sans font-bold text-ink-soft" style={{ fontSize: 13, marginBottom: 4 }}>← Feed</Link>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[900px] px-10 pt-10 pb-24 grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">

        {/* ── Left: avatar + role card ──────────────────────── */}
        <aside className="flex flex-col gap-5 items-center lg:items-start lg:sticky lg:top-24 self-start">
          {isOwnProfile ? (
            <AvatarUploader src={photoUrl} name={fullName} userId={userId} onUploaded={onPhotoUploaded} />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar name={fullName} src={photoUrl || undefined} size={112} />
              {flag && (
                <span style={{ fontSize: 28 }}>{flag}</span>
              )}
            </div>
          )}

          {/* Role card */}
          <div className="w-full flex flex-col gap-1.5"
            style={{ padding: '14px 16px', borderRadius: 8, background: 'var(--accent-tint)', border: '1px solid var(--accent-light)' }}>
            <span className="font-mono uppercase text-accent-deep" style={{ fontSize: 9, letterSpacing: '0.18em' }}>
              Current role
            </span>
            <span className="font-sans font-bold text-ink" style={{ fontSize: 14, lineHeight: 1.3 }}>
              {roleTitle}
            </span>
            {officeCode && (
              <span className="font-mono text-accent-deep" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
                {flag && <span className="mr-1">{flag}</span>}{officeCode}
              </span>
            )}
          </div>
        </aside>

        {/* ── Right: info + bio + activity ──────────────────── */}
        <main className="flex flex-col gap-0 min-w-0">

          {/* Name */}
          <div className="flex flex-col gap-0.5 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
            <span className="font-mono uppercase text-ink-faint" style={{ fontSize: 9, letterSpacing: '0.16em' }}>Full name</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-sans font-bold text-ink" style={{ fontSize: 18 }}>{fullName}</span>
              {flag && <span style={{ fontSize: 20 }}>{flag}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-0.5 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
            <span className="font-mono uppercase text-ink-faint" style={{ fontSize: 9, letterSpacing: '0.16em' }}>Email</span>
            <div className="mt-1">
              {email ? (
                <a href={`mailto:${email}`} className="font-sans text-accent-deep underline" style={{ fontSize: 15, textUnderlineOffset: 3 }}>
                  {email}
                </a>
              ) : (
                <span className="font-sans text-ink-faint italic" style={{ fontSize: 15 }}>
                  {profileLoading ? 'Loading…' : 'Not available — log out and back in to refresh'}
                </span>
              )}
            </div>
          </div>

          {/* Entity: MC → LC */}
          {(mcName || lcName) && (
            <div className="flex flex-col gap-0.5 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
              <span className="font-mono uppercase text-ink-faint" style={{ fontSize: 9, letterSpacing: '0.16em' }}>Entity</span>
              <div className="flex flex-col gap-0.5 mt-1">
                {mcName && <span className="font-sans font-bold text-ink" style={{ fontSize: 15 }}>{mcName}</span>}
                {lcName && (
                  <span className="font-sans text-ink-soft" style={{ fontSize: 13 }}>
                    {mcName ? `↳ ${lcName}` : lcName}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Bio */}
          <div className="flex flex-col gap-2 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono uppercase text-ink-faint" style={{ fontSize: 9, letterSpacing: '0.16em' }}>Bio</span>
              {isOwnProfile && !editingBio && (
                <button type="button" onClick={() => { setBioDraft(bio); setEditingBio(true); }}
                  className="font-sans font-bold text-accent-deep underline" style={{ fontSize: 12, textUnderlineOffset: 3 }}>
                  {bio ? 'Edit' : '+ Add bio'}
                </button>
              )}
            </div>

            {editingBio ? (
              <div className="flex flex-col gap-3 mt-1">
                <Field>
                  <Input multiline rows={4} value={bioDraft}
                    onChange={e => setBioDraft(e.target.value)}
                    placeholder="A sentence or two about you and your entity."
                    style={{ fontSize: 15 }} />
                </Field>
                <div className="flex gap-2">
                  <Btn variant="primary" size="sm" onClick={saveBio} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? 'Saving…' : 'Save bio'}
                  </Btn>
                  <Btn variant="outline" size="sm" onClick={() => setEditingBio(false)}>Cancel</Btn>
                </div>
              </div>
            ) : (
              <p className="font-sans mt-1" style={{
                fontSize: 15, lineHeight: 1.65, margin: 0,
                color: bio ? 'var(--ink)' : 'var(--ink-faint)',
                fontStyle: bio ? 'normal' : 'italic',
              }}>
                {bio || (isOwnProfile ? 'No bio yet — add one above.' : "This member hasn't written a bio yet.")}
              </p>
            )}
          </div>

          {/* ── Activity ───────────────────────────────────── */}
          <div className="flex flex-col gap-0 mt-8">
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: '2px solid var(--ink)' }}>
              <span className="font-display font-bold text-ink" style={{ fontSize: 18, letterSpacing: '-0.01em' }}>
                {isOwnProfile ? 'Your activity' : 'Activity'}
              </span>
              {isOwnProfile && myPosts.length > 0 && (
                <span className="font-mono text-ink-faint" style={{ fontSize: 11 }}>
                  {myPosts.length} {myPosts.length === 1 ? 'post' : 'posts'}
                </span>
              )}
            </div>

            {isOwnProfile ? (
              myPosts.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center gap-2">
                  <span className="font-sans text-ink-faint" style={{ fontSize: 15 }}>
                    No activity yet.
                  </span>
                  <span className="font-sans text-ink-faint" style={{ fontSize: 13 }}>
                    Stories you file will appear here.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col">
                  {myPosts.map(p => <ActivityPost key={p.id} post={p} />)}
                </div>
              )
            ) : (
              <div className="py-10 text-center">
                <span className="font-sans text-ink-faint" style={{ fontSize: 15 }}>
                  No activity yet.
                </span>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
