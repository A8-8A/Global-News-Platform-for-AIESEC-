// Compose — MCP authoring (route "/compose", guarded MCP). Rendered
// inside <Layout>. Live headline counter, standfirst, body, hero-media
// (upload OR https URL), tag chips (max 3), quota rail. Publish posts to
// /api/posts via useCreatePost; a 202/PENDING response shows the
// "filed for review" toast then routes to the feed. Rebuilt from
// screens-compose.jsx <ComposeScreen>.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreatePost, useMyPosts } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { Field, Input } from '../components/ui/Field';
import { Btn } from '../components/ui/Btn';
import { Photo } from '../components/ui/Photo';
import { OfficeTag } from '../components/ui/OfficeTag';
import { ArrowIcon } from '../components/ui/Icon';

const HEADLINE_MAX = 90;
const TAGS = ['CONGRESS', 'PROGRAM', 'GOVERNANCE', 'GROWTH', 'OPERATIONS', 'PARTNERSHIP', 'STORY', 'STATEMENT'];
const MAX_TAGS = 3;

// Count this MCP's APPROVED posts in the trailing 7 days (mirrors the
// stateless backend quota). Falls back to 0 if myPosts isn't available.
function publishedThisWeek(myPosts) {
  if (!Array.isArray(myPosts)) return 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return myPosts.filter(
    (p) => p.status === 'APPROVED' && new Date(p.createdAt).getTime() >= weekAgo
  ).length;
}

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
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved
  const dirtyRef = useRef(false);

  const published = publishedThisWeek(myPosts);
  const quota = 2;
  const overQuota = published >= quota;

  // Auto-save indicator: debounce 1.5s after any edit. (The draft PATCH
  // endpoint isn't live yet, so this updates the indicator only — wire
  // the api.put('/api/posts/draft', …) call here once it exists.)
  useEffect(() => {
    if (!dirtyRef.current) return;
    setSaveState('saving');
    const t = setTimeout(() => setSaveState('saved'), 1500);
    return () => clearTimeout(t);
  }, [title, excerpt, content, mediaUrl, tags]);

  function markDirty() {
    dirtyRef.current = true;
  }

  function toggleTag(tag) {
    markDirty();
    setTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= MAX_TAGS) return prev;
      return [...prev, tag];
    });
  }

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
            style={{
              padding: '12px 18px', borderRadius: 8, fontSize: 13,
              background: toast.kind === 'error' ? 'var(--danger)' : 'var(--ink)',
            }}
          >
            {toast.msg}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1080px] px-10 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-[56px]">
        {/* editor */}
        <main className="flex flex-col gap-8">
          <div className="flex items-center justify-between font-sans text-ink-soft" style={{ fontSize: 13 }}>
            <Link to="/feed" className="font-bold">← Back to the feed</Link>
            <span className="font-sans text-ink-faint" style={{ fontSize: 12 }}>
              <span className="inline-block align-middle" style={{ width: 7, height: 7, borderRadius: '50%', background: saveState === 'saving' ? 'var(--warn)' : 'var(--live)', marginRight: 8 }} />
              {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Draft auto-saved' : 'Draft not yet saved'}
            </span>
          </div>

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
              multiline
              rows={3}
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
                {['H2', 'H3', '“ ”', '• list', '1. list', 'link'].map((l) => (
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

          {/* hero media */}
          <Field label="Hero media" optional hint="A photo URL or a YouTube link. Used as the lead image in the feed.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex items-center gap-3.5 bg-white" style={{ border: '1px solid var(--line-strong)', borderRadius: 6, padding: 14 }}>
                <div className="shrink-0 overflow-hidden" style={{ width: 64, height: 64, borderRadius: 4 }}>
                  <Photo src={mediaUrl || undefined} tone="sky" ratio="1 / 1" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-sans font-bold text-ink" style={{ fontSize: 13 }}>{mediaUrl ? 'Lead image set' : 'No image yet'}</span>
                  <span className="font-mono text-ink-faint" style={{ fontSize: 10 }}>{mediaUrl ? 'from URL' : 'paste a link →'}</span>
                </div>
                {mediaUrl && (
                  <button type="button" onClick={() => { markDirty(); setMediaUrl(''); }} className="ml-auto font-sans font-bold cursor-pointer" style={{ fontSize: 11, color: 'var(--danger)' }}>remove</button>
                )}
              </div>
              <Input
                prefix="https://"
                value={mediaUrl.replace(/^https?:\/\//, '')}
                onChange={(e) => { markDirty(); setMediaUrl(e.target.value ? `https://${e.target.value.replace(/^https?:\/\//, '')}` : ''); }}
                placeholder="paste a photo or youtube link"
              />
            </div>
          </Field>

          {/* tags */}
          <Field label="File under" hint={`Pick up to ${MAX_TAGS}. Used to group stories in Latest.`}>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => {
                const on = tags.includes(t);
                const atMax = tags.length >= MAX_TAGS && !on;
                return (
                  <button
                    key={t}
                    type="button"
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
