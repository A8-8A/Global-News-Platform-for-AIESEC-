// 404 fallback for unmatched routes.

import { Link } from 'react-router-dom';
import { Human } from '../components/Brand';

export default function NotFound() {
  return (
    <div className="max-w-feed mx-auto px-4 py-20 text-center">
      <div className="anim-fade-up">
        <div className="relative inline-block">
          <span className="font-display font-black text-aiesec/15 leading-none"
            style={{ fontSize: '9rem' }}>
            404
          </span>
          <Human className="h-20 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 anim-float" />
        </div>
        <h1 className="font-display font-black text-2xl text-ink mt-2">
          Page not found
        </h1>
        <p className="text-ink-soft text-sm mt-2">
          This page walked off somewhere. Let's get you back.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link to="/" className="px-5 py-2.5 text-sm font-bold rounded-xl border border-line text-ink-soft hover:bg-aiesec-tint transition-colors">
            Home
          </Link>
          <Link to="/feed" className="btn-primary px-5 py-2.5 text-sm">
            Go to feed
          </Link>
        </div>
      </div>
    </div>
  );
}
