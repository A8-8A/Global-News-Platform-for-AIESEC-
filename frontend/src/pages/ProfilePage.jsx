import 'flag-icons/css/flag-icons.min.css';
import { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { useUpdateProfile, useMyPosts, useDeletePost } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Avatar } from '../components/ui/Avatar';
import { Btn } from '../components/ui/Btn';
import { Field, Input } from '../components/ui/Field';
import { Spinner, timeAgo } from '../components/ui/states';
import { ArrowIcon, HeartIcon, CommentIcon } from '../components/ui/Icon';

const MAX_FILE_BYTES = 5 * 1024 * 1024;

/* ── Flag component using flag-icons SVGs ──────────────────────────── */
function Flag({ code, size = 20 }) {
  if (!code || code.length !== 2) return null;
  return (
    <span
      className={`fi fi-${code.toLowerCase()}`}
      style={{
        width: size * 1.333,
        height: size,
        borderRadius: 3,
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
      }}
    />
  );
}

/* ── Avatar uploader ────────────────────────────────────────────────── */
function AvatarUploader({ src, name, userId, onUploaded }) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  function onChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) { setError('File too large — max 5 MB.'); return; }
    const path = `avatars/${userId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });
    setUploading(true); setError(null);
    task.on('state_changed',
      s => setProgress(Math.round(s.bytesTransferred / s.totalBytes * 100)),
      err => { setUploading(false); setError(err.message); },
      async () => { onUploaded(await getDownloadURL(task.snapshot.ref)); setUploading(false); setProgress(0); }
    );
  }

  return (
    <div className="flex flex-col items-center gap-0">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        title="Click to change photo"
        className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
      >
        <Avatar name={name} src={src || undefined} size={108} />
        <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.45)' }}>
          <span className="font-sans font-bold text-white" style={{ fontSize: 12 }}>
            {uploading ? `${progress}%` : 'Change'}
          </span>
        </div>
      </button>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onChange} />
      {error && (
        <p className="font-sans text-center mt-2" style={{ fontSize: 11, color: 'var(--danger)', maxWidth: 140 }}>{error}</p>
      )}
    </div>
  );
}

/* ── Section label ─────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-4">
      <span className="font-display font-bold text-ink" style={{ fontSize: 17, letterSpacing: '-0.01em' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>
  );
}

/* ── Field row ─────────────────────────────────────────────────────── */
function ProfileField({ label, children }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 items-start py-3.5" style={{ borderBottom: '1px solid var(--line)' }}>
      <span className="font-sans text-ink-faint pt-0.5" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.01em' }}>
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

/* ── Activity post card ────────────────────────────────────────────── */
function PostCard({ post, onDelete }) {
  const status = post.status || 'APPROVED';
  const isLive = status === 'APPROVED';
  const statusStyles = {
    APPROVED: { bg: 'rgba(14,106,72,0.08)', color: 'var(--success)', label: 'Published' },
    PENDING:  { bg: 'rgba(122,90,14,0.10)', color: 'var(--warn)',    label: 'Pending review' },
    REJECTED: { bg: 'rgba(156,26,26,0.08)', color: 'var(--danger)',  label: 'Rejected' },
  }[status] || { bg: 'var(--paper-soft)', color: 'var(--ink-soft)', label: status };

  const inner = (
    <div className="flex flex-col gap-2 py-4 group" style={{ borderBottom: '1px solid var(--line)' }}>
      <div className="flex items-center gap-2.5">
        <span className="font-sans font-bold" style={{
          fontSize: 10, letterSpacing: '0.08em', padding: '2px 8px',
          borderRadius: 99, background: statusStyles.bg, color: statusStyles.color,
        }}>{statusStyles.label}</span>
        <span className="font-sans text-ink-faint" style={{ fontSize: 12 }}>{timeAgo(post.createdAt)}</span>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (window.confirm('Delete this post? This cannot be undone.')) onDelete(post.id); }}
            className="ml-auto font-sans font-bold cursor-pointer"
            style={{ fontSize: 11, color: 'var(--danger)', background: 'none', border: 'none', padding: 0 }}
          >
            Delete
          </button>
        )}
      </div>
      <h4 className={`font-display font-bold ${isLive ? 'group-hover:text-accent-deep' : ''} transition-colors`}
        style={{ fontSize: 17, color: 'var(--ink)', lineHeight: 1.25, margin: 0, letterSpacing: '-0.01em' }}>
        {post.title}
      </h4>
      {post.excerpt && (
        <p className="font-sans text-ink-soft" style={{
          fontSize: 13, lineHeight: 1.55, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{post.excerpt}</p>
      )}
      <div className="flex items-center gap-4 font-sans text-ink-faint" style={{ fontSize: 12 }}>
        <span className="inline-flex items-center gap-1.5"><HeartIcon /> {post.likeCount ?? 0} likes</span>
        <span className="inline-flex items-center gap-1.5"><CommentIcon /> {post.commentCount ?? 0} comments</span>
      </div>
    </div>
  );

  return isLive
    ? <Link to={`/feed/${post.id}`} className="no-underline block">{inner}</Link>
    : <div>{inner}</div>;
}

/* ── Page ──────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { id } = useParams();
  const { user: me, loading: authLoading, completeLogin } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();
  const deletePost    = useDeletePost();
  const isOwnProfile = id === 'me';

  // Full DB profile for email, mcName, lcName, officeCode
  const fetchId = isOwnProfile ? me?.id : id;
  const { data: dbProfile } = useQuery({
    queryKey: ['profile', 'db', fetchId],
    queryFn: () => api.get(`/api/users/${fetchId}`),
    enabled: !!fetchId,
    retry: 1,
  });

  const { data: postsData } = useMyPosts();
  const myPosts = isOwnProfile && postsData
    ? (Array.isArray(postsData) ? postsData : postsData?.posts ?? [])
    : [];

  // Local overrides (bio, email user typed in, photo)
  const [emailDraft,   setEmailDraft]   = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingBio,   setEditingBio]   = useState(false);
  const [bioDraft,     setBioDraft]     = useState('');
  const [toast,        setToast]        = useState(null);

  // ── Guards ──
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
      <Btn variant="primary" trailing={<ArrowIcon />} onClick={() => navigate('/login')}>Sign in with AIESEC EXPA</Btn>
    </div>
  );

  const base = dbProfile ?? (isOwnProfile ? me : null);
  if (!base) return (
    <div className="mx-auto max-w-article px-10 py-20 flex items-center gap-3 text-ink-soft">
      <Spinner /> Loading profile…
    </div>
  );

  // Resolved fields — DB wins, JWT fills gaps
  const fullName   = base.fullName  || me?.fullName  || 'AIESEC Member';
  const email      = base.email     || null;
  const bio        = base.bio       || '';
  const photoUrl   = base.photoUrl  || me?.photoUrl  || null;
  const officeCode = base.officeCode || null;
  const mcName     = base.mcName    || null;
  // lcName is the LC — only show if it's different from mcName to avoid duplication
  const lcName     = (base.lcName && base.lcName !== base.mcName) ? base.lcName
                   : (base.officeName && base.officeName !== base.mcName) ? base.officeName
                   : null;
  const roleTitle  = base.roleTitle || me?.roleTitle  || 'Member';
  const userId     = base.id        || me?.id;

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2800); }

  function saveEmail() {
    if (!userId || !emailDraft.trim()) return;
    updateProfile.mutate({ id: userId, email: emailDraft.trim() }, {
      onSuccess: () => {
        setEditingEmail(false);
        showToast('Email saved.');
        if (isOwnProfile && me) completeLogin(localStorage.getItem('aiesec_news_token'), { ...me, email: emailDraft.trim() });
      },
      onError: e => showToast(e.message || 'Could not save email.'),
    });
  }

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
        showToast('Photo updated.');
        if (isOwnProfile && me) completeLogin(localStorage.getItem('aiesec_news_token'), { ...me, photoUrl: url });
      },
      onError: e => showToast(e.message || 'Could not save photo.'),
    });
  }

  // ── Render ──
  return (
    <div className="bg-paper min-h-full">
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 z-50" style={{ top: 88 }}>
          <div className="font-sans font-bold text-white inline-flex items-center"
            style={{ padding: '11px 20px', borderRadius: 8, fontSize: 13, background: 'var(--ink)', boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}>
            {toast}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="mx-auto max-w-[860px] px-10 pt-10 pb-7 flex items-end justify-between">
          <div>
            <span className="eyebrow">{isOwnProfile ? 'Your profile' : 'Member profile'}</span>
            <h1 className="display mt-2" style={{ fontSize: 38, color: 'var(--ink)', lineHeight: 1.06 }}>
              {isOwnProfile
                ? <>The desk, <span className="display-italic" style={{ color: 'var(--accent)' }}>you.</span></>
                : fullName}
            </h1>
          </div>
          <Link to="/feed" className="font-sans font-bold text-ink-soft hover:text-ink transition-colors"
            style={{ fontSize: 13, marginBottom: 4 }}>← Feed</Link>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[860px] px-10 pt-10 pb-24 grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-12">

        {/* Left */}
        <aside className="flex flex-col gap-5 items-center lg:items-start lg:sticky lg:top-24 self-start">
          {isOwnProfile
            ? <AvatarUploader src={photoUrl} name={fullName} userId={userId} onUploaded={onPhotoUploaded} />
            : <Avatar name={fullName} src={photoUrl || undefined} size={108} />
          }

          {/* Role + flag */}
          <div className="w-full flex flex-col gap-2"
            style={{ padding: '14px 16px', borderRadius: 8, background: 'var(--accent-tint)', border: '1px solid var(--accent-light)' }}>
            <span className="font-sans font-bold uppercase text-accent-deep" style={{ fontSize: 9, letterSpacing: '0.16em' }}>
              Role
            </span>
            <span className="font-sans font-bold text-ink" style={{ fontSize: 14, lineHeight: 1.3 }}>
              {roleTitle}
            </span>
            {officeCode && (
              <div className="flex items-center gap-2 mt-0.5">
                <Flag code={officeCode} size={14} />
                <span className="font-mono text-ink-soft" style={{ fontSize: 11, letterSpacing: '0.06em' }}>{officeCode}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Right */}
        <main className="flex flex-col min-w-0">

          <SectionLabel>Identity</SectionLabel>

          {/* Full name */}
          <ProfileField label="Full name">
            <span className="font-sans font-bold text-ink" style={{ fontSize: 15 }}>{fullName}</span>
          </ProfileField>

          {/* Email */}
          <ProfileField label="Email">
            {editingEmail ? (
              <div className="flex flex-col gap-2">
                <Input
                  type="email"
                  value={emailDraft}
                  onChange={e => setEmailDraft(e.target.value)}
                  placeholder="your@email.com"
                  onKeyDown={e => { if (e.key === 'Enter') saveEmail(); if (e.key === 'Escape') setEditingEmail(false); }}
                  style={{ fontSize: 14 }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Btn variant="primary" size="sm" onClick={saveEmail} disabled={updateProfile.isPending || !emailDraft.trim()}>
                    {updateProfile.isPending ? 'Saving…' : 'Save'}
                  </Btn>
                  <Btn variant="outline" size="sm" onClick={() => setEditingEmail(false)}>Cancel</Btn>
                </div>
              </div>
            ) : email ? (
              <div className="flex items-center gap-3">
                <a href={`mailto:${email}`} className="font-sans text-accent-deep underline" style={{ fontSize: 15, textUnderlineOffset: 3 }}>
                  {email}
                </a>
                {isOwnProfile && (
                  <button type="button" onClick={() => { setEmailDraft(email); setEditingEmail(true); }}
                    className="font-sans font-bold text-ink-faint hover:text-accent-deep transition-colors" style={{ fontSize: 12 }}>
                    Edit
                  </button>
                )}
              </div>
            ) : isOwnProfile ? (
              <button type="button" onClick={() => { setEmailDraft(''); setEditingEmail(true); }}
                className="font-sans font-bold text-accent-deep underline" style={{ fontSize: 14, textUnderlineOffset: 3 }}>
                + Add email
              </button>
            ) : (
              <span className="font-sans text-ink-faint italic" style={{ fontSize: 14 }}>Not set</span>
            )}
          </ProfileField>

          {/* Entity */}
          {(mcName || lcName) && (
            <ProfileField label="Entity">
              <div className="flex flex-col gap-0.5">
                {mcName && (
                  <span className="font-sans font-bold text-ink" style={{ fontSize: 15 }}>{mcName}</span>
                )}
                {lcName && (
                  <span className="font-sans text-ink-soft" style={{ fontSize: 13 }}>
                    {lcName}
                  </span>
                )}
              </div>
            </ProfileField>
          )}

          {/* Bio */}
          <ProfileField label="Bio">
            {editingBio ? (
              <div className="flex flex-col gap-2">
                <Field>
                  <Input multiline rows={4} value={bioDraft}
                    onChange={e => setBioDraft(e.target.value)}
                    placeholder="A sentence or two about you and your entity."
                    style={{ fontSize: 14 }} />
                </Field>
                <div className="flex gap-2">
                  <Btn variant="primary" size="sm" onClick={saveBio} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? 'Saving…' : 'Save bio'}
                  </Btn>
                  <Btn variant="outline" size="sm" onClick={() => setEditingBio(false)}>Cancel</Btn>
                </div>
              </div>
            ) : bio ? (
              <div className="flex flex-col gap-1.5">
                <p className="font-sans text-ink" style={{ fontSize: 15, lineHeight: 1.65, margin: 0 }}>{bio}</p>
                {isOwnProfile && (
                  <button type="button" onClick={() => { setBioDraft(bio); setEditingBio(true); }}
                    className="font-sans font-bold text-accent-deep underline self-start" style={{ fontSize: 12, textUnderlineOffset: 3 }}>
                    Edit
                  </button>
                )}
              </div>
            ) : isOwnProfile ? (
              <button type="button" onClick={() => { setBioDraft(''); setEditingBio(true); }}
                className="font-sans font-bold text-accent-deep underline" style={{ fontSize: 14, textUnderlineOffset: 3 }}>
                + Add bio
              </button>
            ) : (
              <span className="font-sans text-ink-faint italic" style={{ fontSize: 14 }}>No bio yet.</span>
            )}
          </ProfileField>

          {/* Activity */}
          <SectionLabel>Activity</SectionLabel>

          {isOwnProfile ? (
            myPosts.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-center"
                style={{ borderRadius: 8, background: 'var(--paper-soft)', border: '1px solid var(--line)' }}>
                <span className="font-sans font-bold text-ink-soft" style={{ fontSize: 15 }}>No activity yet.</span>
                <span className="font-sans text-ink-faint" style={{ fontSize: 13 }}>
                  Stories you file will appear here.
                </span>
                {me?.role === 'MCP' && (
                  <Btn variant="primary" size="sm" className="mt-2" onClick={() => navigate('/compose')}>
                    Write your first story
                  </Btn>
                )}
              </div>
            ) : (
              <div className="flex flex-col">
                {myPosts.map(p => <PostCard key={p.id} post={p} onDelete={(id) => deletePost.mutate(id)} />)}
              </div>
            )
          ) : (
            <div className="py-10 text-center" style={{ borderRadius: 8, background: 'var(--paper-soft)', border: '1px solid var(--line)' }}>
              <span className="font-sans text-ink-faint" style={{ fontSize: 14 }}>No activity yet.</span>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
