// Feed page (route "/feed").
//
// Shows APPROVED posts, newest first. The backend enforces the filter;
// this page renders states: loading skeletons, error, empty, or list.

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { FeedSkeleton, EmptyState, ErrorState } from '../components/ui';
import { Human } from '../components/Brand';

export default function Feed() {
  const { isMcp, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  const load = useCallback(() => {
    setStatus('loading');
    api
      .get('/api/feed')
      .then((data) => {
        setPosts(data || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(load, [load]);

  return (
    <div className="max-w-feed mx-auto px-4 py-8">
      {/* feed hero strip */}
      <div
        className="rounded-2xl px-6 py-7 mb-6 relative overflow-hidden anim-fade-up"
        style={{ background: 'linear-gradient(135deg,#037EF3,#024a91)' }}
      >
        <div className="blob" style={{ width: 200, height: 200, background: '#7cc0ff', top: -80, right: -50, opacity: 0.45 }} />
        <Human className="h-16 absolute right-4 bottom-0 opacity-20" />
        <div className="relative">
          <h1 className="font-display font-black text-2xl text-white">
            Global Feed
          </h1>
          <p className="text-white/80 text-sm mt-1">
            The latest from committees across the AIESEC network.
          </p>
          {isMcp && (
            <Link
              to="/compose"
              className="inline-block mt-4 bg-white text-aiesec font-extrabold text-sm px-5 py-2.5 rounded-xl hover:-translate-y-0.5 hover:shadow-glow-lg transition-all"
            >
              + Share an update
            </Link>
          )}
        </div>
      </div>

      {/* states */}
      {status === 'loading' && <FeedSkeleton count={4} />}

      {status === 'error' && (
        <ErrorState
          message="We could not load the feed. The server may be waking up - give it a moment."
          onRetry={load}
        />
      )}

      {status === 'ready' && posts.length === 0 && (
        <EmptyState
          icon="📰"
          title="No updates yet"
          message={
            isMcp
              ? 'The feed is quiet. Be the first MCP to share an update with the network.'
              : 'Nothing has been posted yet. Check back soon - committee updates will appear here.'
          }
          action={
            isMcp ? (
              <Link to="/compose" className="btn-primary px-5 py-2.5 text-sm">
                Write the first post
              </Link>
            ) : !isAuthenticated ? (
              <Link to="/login" className="btn-primary px-5 py-2.5 text-sm">
                Log in with AIESEC
              </Link>
            ) : null
          }
        />
      )}

      {status === 'ready' && posts.length > 0 && (
        <div className="space-y-5 stagger">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
