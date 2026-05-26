// 404 fallback for unmatched routes.

import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-feed mx-auto px-4 py-24 text-center">
      <p className="font-display font-black text-aiesec text-6xl">404</p>
      <h1 className="font-display font-extrabold text-2xl text-ink mt-3">
        Page not found
      </h1>
      <p className="text-ink-soft text-sm mt-2">
        The page you are looking for does not exist.
      </p>
      <div className="mt-6 flex gap-3 justify-center">
        <Link to="/" className="btn-outline px-5 py-2.5 text-sm">
          Home
        </Link>
        <Link to="/feed" className="btn-primary px-5 py-2.5 text-sm">
          Go to feed
        </Link>
      </div>
    </div>
  );
}
