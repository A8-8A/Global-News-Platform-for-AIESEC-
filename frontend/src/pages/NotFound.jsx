// 404 fallback for unmatched routes.

import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center mt-16">
      <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
      <Link to="/" className="text-aiesec hover:underline text-sm mt-2 inline-block">
        Back to feed
      </Link>
    </div>
  );
}
