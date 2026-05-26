// Feed page (route "/feed").
// Approved posts, newest first. States: loading, error, empty, list.

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { FeedSkeleton, EmptyState, ErrorState } from '../components/ui';

export default function Feed() {
  const { isMcp, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');

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
      {/* header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-ink">
            Global Feed
          </h1>
          <p className="text-sm text-ink-soft mt-0.5">
            The latest from committees across the network.
          </p>
        </div>
        {isMcp && (
          <Link to="/compose" className="btn-primary px-4 py-2 text-sm shrink-0">
            New post
          </Link>
        )}
      </div>

      {status === 'loading' && <FeedSkeleton count={4} />}

      {status === 'error' && (
        <ErrorState
          message="We could not load the feed. The server may be waking up - give it a moment, then try again."
          onRetry={load}
        />
      )}

      {status === 'ready' && posts.length === 0 && (
        <EmptyState
          title="No updates yet"
          message={
            isMcp
              ? 'The feed is empty. Be the first MCP to share an update with the network.'
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
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
