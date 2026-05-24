// Feed page - the public landing view.
//
// Shows APPROVED posts only, newest first. The backend enforces the
// "approved only" filter; this page just renders what it gets.

import { useEffect, useState } from 'react';
import { api } from '../api/client';
import PostCard from '../components/PostCard';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    // Public endpoint (to be implemented): GET /api/feed
    //   response: [ { id, title, content, authorName, authorOffice,
    //                  mediaUrl, likeCount, commentCount, createdAt } ]
    api
      .get('/api/feed')
      .then((data) => {
        setPosts(data || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') {
    return <p className="text-center text-gray-500">Loading feed...</p>;
  }

  if (status === 'error') {
    return (
      <p className="text-center text-gray-500">
        Could not load the feed. Is the backend running?
      </p>
    );
  }

  if (posts.length === 0) {
    return <p className="text-center text-gray-500">No posts yet.</p>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
