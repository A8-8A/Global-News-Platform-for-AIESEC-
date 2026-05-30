import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { useCreatePost, useMyPosts } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { Field, Input } from '../components/ui/Field';
import { Btn } from '../components/ui/Btn';
import { ArrowIcon } from '../components/ui/Icon';

const HEADLINE_MAX = 90;
const TAGS = ['CONGRESS','PROGRAM','GOVERNANCE','GROWTH','OPERATIONS','PARTNERSHIP','STORY','STATEMENT'];
const MAX_TAGS = 3;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function publishedThisWeek(myPosts) {
  if (!Array.isArray(myPosts)) return 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return myPosts.filter(p => p.status === 'APPROVED' && new Date(p.createdAt).getTime() >= weekAgo).length;
}

/* ── Image upload area ─────────────────────────────────────────── */
function ImageUpload({ onUrlChange }) {
  const [status,   setStatus]   = useState('idle'); // idle | uploading | done | error
  const [progress, setProgress] = useState(0);
  const [url,      setUrl]      = useState('');
  const [fileName, setFileName] = useState('');
  const [error,    setError]    = useState('');
  const fileRef = useRef(null);

  function upload(file) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) { setError('File too large — max 10 MB.'); return; }
    const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `post-images/${Date.now()}-${safe}`;
    const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });
    setStatus('uploading'); setError(''); setFileName(file.name);

    task.on('state_changed',
      s => setProgress(Math.round(s.bytesTransferred / s.totalBytes * 100)),
      err => { setStatus('error'); setError(err.message); },
      async () => {
        const u = await getDownloadURL(task.snapshot.ref);
        setUrl(u); setStatus('done'); setProgress(100);
        onUrlChange(u);
      }
    );
  }

  function clear() {
    setStatus('idle'); setUrl(''); setFileName(''); setError(''); setProgress(0);
    onUrlChange('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function onFile(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) upload(f);
  }

  return (
    <div className="flex flex-col gap-2">
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFile} />

      {status === 'idle' && (
        <button type="button" onClick={() => fileRef.current?.click()}
          className="w-full h-24 rounded-md border-2 border-dashed font-sans font-bold text-ink-soft hover:text-accent-deep hover:border-accent-light transition-colors cursor-pointer"
          style={{ borderColor: 'var(--line-strong)', fontSize: 13, background: 'var(--paper-soft)' }}>
          Click to upload an image · JPEG, PNG, WebP, GIF · max 10 MB
        </button>
      )}

      {status === 'uploading' && (
        <div className="flex flex-col gap-2 p-4 rounded-md" style={{ background: 'var(--accent-tint)', border: '1px solid var(--accent-light)' }}>
          <div className="flex items-center justify-between font-sans" style={{ fontSize: 13 }}>
            <span className="font-bold text-ink truncate">{fileName}</span>
            <span className="text-ink-soft ml-4">{progress}%</span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 4, background: 'var(--accent-light)' }}>
            <div className="h-full transition-all" style={{ width: `${progress}%`, background: 'var(--accent)', borderRadius: 999 }} />
          </div>
        </div>
      )}

      {status === 'done' && (
        <div className="flex items-center gap-3 p-3 rounded-md" style={{ background: 'var(--paper-soft)', border: '1px solid var(--line)' }}>
          <img src={url} alt="preview" className="rounded" style={{ width: 56, height: 56, objectFit: 'cover', flexShrink: 0 }} />
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="font-sans font-bold text-ink truncate" style={{ fontSize: 13 }}>{fileName}</span>
            <span className="font-mono text-ink-faint" style={{ fontSize: 10 }}>Uploaded to Firebase Storage ✓</span>
          </div>
          <button type="button" onClick={clear} className="font-sans font-bold shrink-0 cursor-pointer" style={{ fontSize: 11, color: 'var(--danger)' }}>Remove</button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center justify-between p-3 rounded-md" style={{ background: 'rgba(156,26,26,0.06)', border: '1px solid rgba(156,26,26,0.2)' }}>
          <span className="font-sans font-bold" style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>
          <button type="button" onClick={clear} className="font-sans font-bold cursor-pointer" style={{ fontSize: 12, color: 'var(--danger)' }}>Try again</button>
        </div>
      )}
    </div>
  );
}

export default function ComposePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createPost = useCreatePost();
  const { data: myPosts } = useMyPosts();

  const [title,    setTitle]    = useState('');
  const [excerpt,  setExcerpt]  = useState('');
  const [content,  setContent]  = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [tags,     setTags]     = useState([]);
  const [toast,    setToast]    = useState(null);

  const published  = publishedThisWeek(myPosts);
  const quota      = 2;
  const overQuota  = published >= quota;
  const headlineOver = title.length > HEADLINE_MAX;

  const handleMediaUrl = useCallback((url) => setMediaUrl(url), []);

  function toggleTag(tag) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag)
      : prev.length >= MAX_TAGS ? prev : [...prev, tag]);
  }

  function publish() {
    if (!title.trim()) { setToast({ kind: 'error', msg: 'Add a headline before publishing.' }); return; }
    createPost.mutate(
      { title: title.trim(), content: content.trim(), excerpt: excerpt.trim() || undefined, mediaUrl: mediaUrl || undefined, tag: tags[0] || undefined },
      {
        onSuccess: (res) => {
          const pending = res?.status === 'PENDING';
          setToast({ kind: 'success', msg: pending ? 'Filed for review. An editor will look at it shortly.' : 'Published to the feed.' });
          setTimeout(() => navigate('/feed'), 1200);
        },
        onError: (e) => setToast({ kind: 'error', msg: e.message || 'Could not publish. Try again.' }),
      }
    );
  }

  return (
    <div className="bg-paper">
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 z-50" style={{ top: 88 }}>
          <div className="font-sans font-bold text-white inline-flex items-center gap-2"
            style={{ padding: '12px 18px', borderRadius: 8, fontSize: 13, background: toast.kind === 'error' ? 'var(--danger)' : 'var(--ink)' }}>
            {toast.msg}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1080px] px-10 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-[56px]">
        <main className="flex flex-col gap-8">
          <Link to="/feed" className="font-sans font-bold text-ink-soft" style={{ fontSize: 13 }}>← Back to the feed</Link>

          <div className="flex flex-col gap-1">
            <span className="font-sans text-ink-soft" style={{ fontSize: 12 }}>
              Filing as <strong className="text-ink">{user?.fullName || 'you'}</strong>
              {user?.officeName ? ` · ${user.officeName}` : ''}
            </span>
            <h1 className="display" style={{ fontSize: 40, color: 'var(--ink)' }}>Write the story.</h1>
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-2">
            <Field label="Headline">
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="A clear, editorial headline"
                className="w-full box-border bg-transparent outline-none"
                style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink)', lineHeight: 1.15, border: 'none', borderBottom: '2px solid var(--line-strong)', padding: '10px 0' }} />
            </Field>
            <div className="flex justify-between font-sans text-ink-faint" style={{ fontSize: 12 }}>
              <span>Aim for under 90 characters.</span>
              <span className="font-mono" style={{ color: headlineOver ? 'var(--danger)' : 'var(--ink-faint)' }}>{title.length} / {HEADLINE_MAX}</span>
            </div>
          </div>

          {/* Standfirst */}
          <Field label="Standfirst" hint="One paragraph shown as the preview on the feed card.">
            <Input multiline rows={3} value={excerpt} onChange={e => setExcerpt(e.target.value)}
              placeholder="The summary shown on the feed card." style={{ minHeight: 88, fontSize: 16 }} />
          </Field>

          {/* Body — plain textarea, no fake toolbar */}
          <Field label="Body">
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Write like a correspondent. Lead with the specific. Use blank lines to separate paragraphs."
              className="w-full outline-none resize-y font-sans text-ink bg-white"
              style={{ padding: '18px 20px', minHeight: 280, fontSize: 16, lineHeight: 1.7, border: '1px solid var(--line-strong)', borderRadius: 6 }} />
          </Field>

          {/* Hero image */}
          <Field label="Hero image" optional>
            <ImageUpload onUrlChange={handleMediaUrl} />
          </Field>

          {/* Tags */}
          <Field label="File under" hint={`Pick up to ${MAX_TAGS}.`}>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(t => {
                const on = tags.includes(t);
                const atMax = tags.length >= MAX_TAGS && !on;
                return (
                  <button key={t} type="button" onClick={() => toggleTag(t)} disabled={atMax}
                    className="font-sans font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ padding: '7px 14px', borderRadius: 999, fontSize: 11, letterSpacing: '0.06em', background: on ? 'var(--accent)' : 'transparent', color: on ? '#fff' : 'var(--ink-soft)', border: on ? '1px solid var(--accent)' : '1px solid var(--line-strong)' }}>
                    {t}
                  </button>
                );
              })}
            </div>
          </Field>
        </main>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 self-start">
          <Btn variant="primary" size="lg" full trailing={<ArrowIcon />} onClick={publish} disabled={createPost.isPending}>
            {createPost.isPending ? 'Publishing…' : 'Publish to the feed'}
          </Btn>

          {/* Quota */}
          <div className="flex flex-col gap-3" style={{ border: '1px solid var(--line)', borderRadius: 6, padding: 20, background: 'var(--accent-tint)' }}>
            <div className="flex items-center justify-between">
              <span className="font-sans font-bold uppercase text-accent-deep" style={{ fontSize: 10, letterSpacing: '0.14em' }}>This week</span>
              <span className="font-sans text-ink-faint" style={{ fontSize: 11 }}>rolling 7 days</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="display" style={{ fontSize: 44, color: 'var(--ink)' }}>{published}</span>
              <span style={{ fontFamily: 'var(--display)', fontWeight: 500, fontSize: 20, color: 'var(--ink-faint)' }}>/ {quota}</span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: quota }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < published ? 'var(--accent)' : 'rgba(26,34,51,0.08)' }} />
              ))}
            </div>
            <p className="font-sans text-ink-soft" style={{ fontSize: 12, lineHeight: 1.5 }}>
              {overQuota ? 'Weekly limit reached. Next post goes to the moderation queue.' : 'First 2 posts publish immediately.'}
            </p>
          </div>

          <p className="font-sans text-ink-soft" style={{ padding: '14px 0', borderTop: '1px solid var(--line)', fontSize: 13, lineHeight: 1.6 }}>
            <strong className="text-ink">House style.</strong> Write like a correspondent, not a press release. Lead with the specific.
          </p>
        </aside>
      </div>
    </div>
  );
}
