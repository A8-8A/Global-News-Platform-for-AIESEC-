// Sticky public top nav. Role-aware: shows "Write" for MCPs, an Avatar
// for any signed-in user, or a "Sign in" button for guests. The search
// button toggles a simple inline search drawer. Translated from the
// TopNav atom in ds-atoms.jsx and wired to the router + AuthContext.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import { Avatar } from './Avatar';
import { Btn } from './Btn';
import { SearchIcon } from './Icon';

const NAV_ITEMS = [
  { id: 'feed', label: 'Feed', to: '/feed' },
];

export function TopNav({ active = 'feed' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-20 border-b border-line"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}
    >
      <div className="mx-auto max-w-feed px-10 h-[72px] flex items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Link to="/feed" aria-label="AIESEC News home">
            <Logo height={22} />
          </Link>
          <nav className="hidden md:flex items-center gap-1.5">
            {NAV_ITEMS.map((it) => {
              const isActive = active === it.id;
              return (
                <Link
                  key={it.id}
                  to={it.to}
                  className={[
                    'px-3.5 py-2 rounded-md font-sans transition-colors',
                    isActive
                      ? 'font-bold text-accent-deep bg-accent-soft'
                      : 'font-medium text-ink-soft hover:bg-accent-soft hover:text-accent-deep',
                  ].join(' ')}
                  style={{ fontSize: 13 }}
                >
                  {it.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3.5">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="w-10 h-10 rounded-md inline-flex items-center justify-center bg-transparent border border-line text-ink-soft hover:bg-paper-soft transition-colors"
          >
            <SearchIcon size={16} />
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'MCP' && (
                <Btn size="sm" variant="primary" onClick={() => navigate('/compose')}>
                  Write
                </Btn>
              )}
              <button
                type="button"
                onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : '/feed')}
                aria-label="Account"
                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Avatar name={user.fullName || user.name} size={36} />
              </button>
            </div>
          ) : (
            <Btn size="sm" variant="primary" onClick={() => navigate('/login')}>
              Sign in
            </Btn>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line bg-white">
          <div className="mx-auto max-w-feed px-10 py-3 flex items-center gap-3">
            <SearchIcon size={16} />
            <input
              autoFocus
              placeholder="Search the desk — entity, author, headline…"
              className="flex-1 h-9 bg-transparent border-none outline-none font-sans text-ink"
              style={{ fontSize: 14 }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearchOpen(false);
              }}
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="font-mono text-ink-faint"
              style={{ fontSize: 11, letterSpacing: '0.1em' }}
            >
              ESC
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default TopNav;
