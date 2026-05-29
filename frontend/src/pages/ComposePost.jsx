// Compose — MCP authoring (route "/compose", guarded MCP). Rendered
// inside <Layout>. Live headline counter, standfirst, body, hero-media
// (Firebase Storage upload OR https URL fallback), tag chips (max 3),
// quota rail. Publish posts to /api/posts via useCreatePost.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { useCreatePost, useMyPosts } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { Field, Input } from '../components/ui/Field';
import { Btn } from '../components/ui/Btn';
import { Photo } from '../components/ui/Photo';
import { OfficeTag } from '../components/ui/OfficeTag';
import { ArrowIcon, XIcon } from '../components/ui/Icon';

const HEADLINE_MAX = 90;
const TAGS = ['CONGRESS', 'PROGRAM', 'GOVERNANCE', 'GROWTH', 'OPERATIONS', 'PARTNERSHIP', 'STORY', 'STATEMENT'];
const MAX_TAGS = 3;
// 10 MB limit — keeps Storage costs low and load times fast.
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif';

function publishedThisWeek(myPosts) {
  if (!Array.isArray(myPosts)) return 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return myPosts.filter(
    (p) => p.status === 'APPROVED' && new Date(p.createdAt).getTime() >= weekAgo
  ).length;
}

/* ---------- Firebase Storage uploader hook ---------- */
function useStorageUpload() {
  const [state, setState] = useState({
    status: 'idle',   // idle | uploading | done | error
    progress: 0,      // 0–100
    url: '',
    fileName: '',
    error: null,
  });
  const taskRef = useRef(null);

  function upload(file) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setState((s) => ({ ...s, status: 'error', error: 'File is too large (max 10 MB).' }));
      return;
    }
    // Path: post-images/<timestamp>-<sanitised filename>
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `post-images/${Date.now()}-${safeName}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
    taskRef.current = task;

    setState({ status: 'uploading', progress: 0, url: '', fileName: file.name, error: null });

    task.on(
      'state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setState((s) => ({ ...s, progress: pct }));
      },
      (err) => {
        setState((s) => ({ ...s, status: 'error', error: err.message }));
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setState((s) => ({ ...s, status: 'done', url, progress: 100 }));
      }
    );
  }

  function cancel() {
    taskRef.current?.cancel();
    setState({ status: 'idle', progress: 0, url: '', fileName: '', error: null });
  }

  return { ...state, upload, cancel };
}

/* ---------- Hero media widget ---------- */
function HeroMedia({ onUrlChange }) {
  const uploader = useStorageUpload();
  const [externalUrl, setExternalUrl] = useState('');
  const fileInputRef = useRef(null);

  // Whenever the resolved URL changes (upload done, external typed, or cleared)
  // bubble it up to the parent form.
  const activeUrl = uploader.status === 'done' ? uploader.url : externalUrl;

  useEffect(() => {
    onUrlChange(activeUrl);
  }, [activeUrl, onUrlChange]);

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Clear any external URL when a file is chosen.
    setExternalUrl('');
    uploader.upload(file);
    // Reset input so picking the same file again fires onChange.
    e.target.value = '';
  }

  function clearAll() {
    uploader.cancel();
    setExternalUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const hasImage = uploader.status === 'done' || externalUrl;

  return (
    <div className="flex flex-col gap-3">
      {/* Preview / upload-progress card */}
      <div
        className="flex items-center gap-3.5 bg-white"
        style={{ border: '1px solid var(--line-strong)', borderRadius: 6, padding: 14, minHeight: 76 }}
      >
        {/* Thumbnail / gradient placeholder */}
        <div className="shrink-0 overflow-hidden" style={{ width: 64, height: 64, borderRadius: 4 }}>
          <Photo src={hasImage ? activeUrl : undefined} tone="sky" ratio="1 / 1" />
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {uploader.status === 'uploading' && (
            <>
              <span className="font-sans font-bold text-ink truncate" style={{ fontSize: 13 }}>
                {uploader.fileName}
              </span>
              {/* Progress bar */}
              <div className="rounded-full overflow-hidden" style={{ height: 4, background: 'var(--paper-deep)' }}>
                <div
                  className="h-full transition-all"
                  style={{ width: `${uploader.progress}%`, background: 'var(--accent)', borderRadius: 999 }}
                />
              </div>
              <span className="font-mono text-ink-faint" style={{ fontSize: 10 }}>
                Uploading… {uploader.progress}%
              </span>
            </>
          )}

          {uploader.status === 'done' && (
            <>
              <span className="font-sans font-bold text-ink truncate" style={{ fontSize: 13 }}>
                {uploader.fileName}
              </span>
              <span className="font-mono text-ink-faint" style={{ fontSize: 10 }}>Uploaded to Firebase Storage ✓</span>
            </>
          )}

          {uploader.status === 'error' && (
            <span className="font-sans font-bold" style={{ fontSize: 12, color: 'var(--danger)' }}>
              {uploader.error}
            </span>
          )}

          {externalUrl && uploader.status === 'idle' && (
            <>
              <span className="font-sans font-bold text-ink" style={{ fontSize: 13 }}>External link set</span>
              <span className="font-mono text-ink-faint truncate" style={{ fontSize: 10 }}>{externalUrl}</span>
            </>
          )}

          {!hasImage && uploader.status !== 'uploading' && uploader.status !== 'error' && (
            <>
              <span className="font-sans font-bold text-ink-soft" style={{ fontSize: 13 }}>No image yet</span>
              <span className="font-mono text-ink-faint" style={{ fontSize: 10 }}>upload a file or paste a link →</span>
            </>
          )}
        </div>

        {/* Clear button */}
        {(hasImage || uploader.status === 'uploading' || uploader.status === 'error') && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto shrink-0 inline-flex items-center gap-1 font-sans font-bold cursor-pointer"
            style={{ fontSize: 11, color: 'var(--danger)' }}
          >
            <XIcon size={12} /> remove
          </button>
        )}
      </div>

      {/* Controls row: upload button + external URL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={onFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploader.status === 'uploading'}
          className="h-11 rounded-md font-sans font-bold text-ink border border-line-strong bg-white hover:bg-paper-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: 13 }}
        >
          {uploader.status === 'uploading' ? `Uploading ${uploader.progress}%…` : '↑ Upload photo'}
        </button>

        <Input
          prefix="https://"
          value={externalUrl.replace(/^https?:\/\//, '')}
          onChange={(e) => {
            // Clear any Storage upload when the user switches to a URL.
            if (uploader.status !== 'idle') uploader.cancel();
            setExternalUrl(e.target.value ? `https://${e.target.value.replace(/^https?:\/\//, '')}` : '');
          }}
          placeholder="or paste a YouTube / Vimeo link"
          disabled={uploader.status === 'uploading'}
        />
      </div>

      <p className="font-sans text-ink-faint" style={{ fontSize: 11 }}>
        JPEG, PNG, WebP or GIF · max 10 MB. Stored in Firebase Storage under <span className="font-mono">post-images/</span>.
      </p>
    </div>
  );
}

/* ---------- Page ---------- */
export default function ComposePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createPost = useCreatePost();
  const { data: myPosts } = useMyPosts();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [tags, setTags] = useState([]);
  const [toast, setToast] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const dirtyRef = useRef(false);

  const published = publishedThisWeek(myPosts);
  const quota = 2;
  const overQuota = published >= quota;

  useEffect(() => {
    if (!dirtyRef.current) return;
    setSaveState('saving');
    const t = setTimeout(() => setSaveState('saved'), 1500);
    return () => clearTimeout(t);
  }, [title, excerpt, content, mediaUrl, tags]);

  function markDirty() { dirtyRef.current = true; }

  function toggleTag(tag) {
    markDirty();
    setTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= MAX_TAGS) return prev;
      return [...prev, tag];
    });
  }

  // Stable callback for HeroMedia — won't cause re-renders on every keystroke.
  const handleMediaUrl = useRef((url) => {
    markDirty();
    setMediaUrl(url);
  });

  function publish() {
    if (!title.trim()) {
      setToast({ kind: 'error', msg: 'Add a headline before publishing.' });
      return;
    }
    const payload = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || undefined,
      mediaUrl: mediaUrl.trim() || undefined,
      tag: tags[0] || undefined,
    };
    createPost.mutate(payload, {
      onSuccess: (res) => {
        const pending = res?.status === 'PENDING';
        setToast({
          kind: 'success',
          msg: pending
            ? 'Filed for review. An editor will look at it shortly.'
            : 'Published to the feed.',
        });
        setTimeout(() => navigate('/feed'), 1200);
      },
      onError: (e) => setToast({ kind: 'error', msg: e.message || 'Could not publish. Try again.' }),
    });
  }

  const headlineCount = title.length;
  const headlineOver = headlineCount > HEADLINE_MAX;

  return (
    <div className="bg-paper">
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 z-50" style={{ top: 88 }}>
          <div
            className="font-sans font-bold text-white inline-flex items-center gap-2 shadow-card"
            style={{ padding: '12px 18px', borderRadius: 8, fontSize: 13, background: toast.kind === 'error' ? 'var(--danger)' : 'var(--ink)' }}
          >
            {toast.msg}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1080px] px-10 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-[56px]">
        <main className="flex flex-col gap-8">
          {/* breadcrumb + save state */}
          <div className="flex items-center justify-between font-sans text-ink-soft" style={{ fontSize: 13 }}>
            <Link to="/feed" className="font-bold">← Back to the feed</Link>
            <span className="font-sans text-ink-faint" style={{ fontSize: 12 }}>
              <span className="inline-block align-middle" style={{ width: 7, height: 7, borderRadius: '50%', background: saveState === 'saving' ? 'var(--warn)' : 'var(--live)', marginRight: 8 }} />
              {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Draft auto-saved' : 'Draft not yet saved'}
            </span>
          </div>

          {/* byline */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              {user?.officeCode && <OfficeTag code={user.officeCode} mode="chip" />}
              <span className="font-sans text-ink-soft" style={{ fontSize: 12 }}>
                filing as <strong className="text-ink">{user?.fullName || 'you'}</strong>
              </span>
            </div>
            <h1 className="display" style={{ fontSize: 40, color: 'var(--ink)' }}>Write the story.</h1>
          </div>

          {/* headline */}
          <div className="flex flex-col gap-2">
            <Field label="Headline">
              <input
                value={title}
                onChange={(e) => { markDirty(); setTitle(e.target.value); }}
                placeholder="A clear, editorial headline"
                className="w-full box-border bg-transparent outline-none"
                style={{
                  fontFamily: 'var(--display)', fontSize: 28, fontWeight: 700,
                  letterSpacing: '-0.01em', color: 'var(--ink)', lineHeight: 1.15,
                  border: 'none', borderBottom: '2px solid var(--line-strong)', padding: '10px 0',
                }}
              />
            </Field>
            <div className="flex justify-between font-sans text-ink-faint" style={{ fontSize: 12 }}>
              <span>Aim for under 90 characters. Editorial, not promotional.</span>
              <span className="font-mono" style={{ color: headlineOver ? 'var(--danger)' : 'var(--ink-faint)' }}>{headlineCount} / {HEADLINE_MAX}</span>
            </div>
          </div>

          {/* standfirst */}
          <Field label="Standfirst" hint="One paragraph that makes a hurried reader want to keep reading.">
            <Input
              multiline rows={3}
              value={excerpt}
              onChange={(e) => { markDirty(); setExcerpt(e.target.value); }}
              placeholder="The summary shown on the feed card."
              style={{ minHeight: 88, fontSize: 16, color: 'var(--ink-soft)' }}
            />
          </Field>

          {/* body */}
          <Field label="Body">
            <div className="bg-white flex flex-col overflow-hidden" style={{ border: '1px solid var(--line-strong)', borderRadius: 6 }}>
              <div className="flex items-center gap-1" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)', background: 'var(--paper-soft)' }}>
                {[{ l: 'B', s: { fontWeight: 800 } }, { l: 'I', s: { fontStyle: 'italic' } }, { l: 'U', s: { textDecoration: 'underline' } }].map((t) => (
                  <span key={t.l} className="inline-flex items-center justify-center cursor-pointer text-ink" style={{ width: 30, height: 30, borderRadius: 4, fontFamily: 'var(--sans)', fontSize: 13, ...t.s }}>{t.l}</span>
                ))}
                <div style={{ width: 1, height: 18, background: 'var(--line)', margin: '0 6px' }} />
                {['H2', 'H3', '" "', '• list', '1. list', 'link'].map((l) => (
                  <span key={l} className="font-sans font-medium cursor-pointer text-ink-soft" style={{ fontSize: 12, padding: '6px 10px', borderRadius: 4 }}>{l}</span>
                ))}
                <span className="ml-auto font-mono text-ink-faint" style={{ fontSize: 10, letterSpacing: '0.1em' }}>MARKDOWN</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => { markDirty(); setContent(e.target.value); }}
                placeholder="Write like a correspondent. Lead with the specific."
                className="w-full outline-none resize-y font-sans text-ink bg-white"
                style={{ padding: '24px 26px', minHeight: 240, fontSize: 16, lineHeight: 1.7, border: 'none' }}
              />
            </div>
          </Field>

          {/* hero media — Firebase Storage upload */}
          <Field label="Hero media" optional>
            <HeroMedia onUrlChange={handleMediaUrl.current} />
          </Field>

          {/* tags */}
          <Field label="File under" hint={`Pick up to ${MAX_TAGS}. Used to group stories in Latest.`}>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => {
                const on = tags.includes(t);
                const atMax = tags.length >= MAX_TAGS && !on;
                return (
                  <button
                    key={t} type="button"
                    onClick={() => toggleTag(t)}
                    disabled={atMax}
                    className="font-sans font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    style={{
                      padding: '7px 14px', borderRadius: 999, fontSize: 11, letterSpacing: '0.06em',
                      background: on ? 'var(--accent)' : 'transparent',
                      color: on ? '#fff' : 'var(--ink-soft)',
                      border: on ? '1px solid var(--accent)' : '1px solid var(--line-strong)',
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </Field>
        </main>

        {/* sidebar */}
        <aside className="flex flex-col gap-7 lg:sticky lg:top-24 self-start">
          <div className="flex flex-col gap-2.5">
            <Btn variant="primary" size="lg" full trailing={<ArrowIcon />} onClick={publish} disabled={createPost.isPending}>
              {createPost.isPending ? 'Publishing…' : 'Publish to the feed'}
            </Btn>
            <Btn variant="outline" size="md" full onClick={() => setToast({ kind: 'success', msg: 'Draft saved.' })}>Save draft</Btn>
          </div>

          {/* quota card */}
          <div className="flex flex-col gap-3.5" style={{ border: '1px solid var(--line)', borderRadius: 6, padding: 22, background: 'var(--accent-tint)' }}>
            <div className="flex items-center justify-between">
              <span className="font-sans font-bold uppercase text-accent-deep" style={{ fontSize: 11, letterSpacing: '0.14em' }}>This week</span>
              <span className="font-sans text-ink-faint" style={{ fontSize: 11 }}>rolling 7 days</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="display" style={{ fontSize: 48, color: 'var(--ink)' }}>{published}</span>
              <span style={{ fontFamily: 'var(--display)', fontWeight: 500, fontSize: 22, color: 'var(--ink-faint)' }}>/ {quota}</span>
              <span className="font-sans text-ink-soft" style={{ fontSize: 12, marginLeft: 8 }}>posts published</span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: quota }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < published ? 'var(--accent)' : 'rgba(26,34,51,0.08)' }} />
              ))}
            </div>
            <p className="font-sans text-ink-soft" style={{ fontSize: 12, lineHeight: 1.55 }}>
              {overQuota
                ? 'You\u2019ve hit your weekly limit. Additional posts go to the moderation queue for an editor to review.'
                : 'Your next post publishes immediately. After your 2nd, additional posts go to the moderation queue.'}
            </p>
          </div>

          <div className="font-sans text-ink-soft" style={{ padding: '18px 0', borderTop: '1px solid var(--line)', fontSize: 13, lineHeight: 1.6 }}>
            <strong className="text-ink">House style.</strong> Write like a correspondent, not a press release. Lead with the specific. Cite numbers in the body, not the headline.
          </div>
        </aside>
      </div>
    </div>
  );
}
