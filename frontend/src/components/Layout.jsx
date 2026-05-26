// Shared app shell: a sticky branded header + the routed page below.
// Used by every page except the standalone Landing page.

import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Brand';

export default function Layout() {
  const { user, isAuthenticated, isMcp, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const navLink = (to, label) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={
          'relative px-1 py-1 text-sm font-bold transition-colors ' +
          (active ? 'text-white' : 'text-white/70 hover:text-white')
        }
      >
        {label}
        <span
          className={
            'absolute -bottom-1 left-0 h-0.5 rounded-full bg-white transition-all duration-300 ' +
            (active ? 'w-full' : 'w-0')
          }
        />
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ---- Header ---- */}
      <header className="sticky top-0 z-40">
        <div
          className="border-b border-white/10"
          style={{
            background:
              'linear-gradient(120deg, #024a91 0%, #037EF3 55%, #0264c2 100%)',
          }}
        >
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo -> landing */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="bg-white rounded-lg px-2.5 py-1.5 shadow-sm transition-transform group-hover:scale-105">
                <Logo className="h-5" />
              </span>
              <span className="hidden sm:block text-white font-display font-extrabold text-lg leading-none">
                News<span className="text-white/60"> Platform</span>
              </span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-5">
              {navLink('/feed', 'Feed')}
              {isMcp && navLink('/compose', 'Post')}
              {isAdmin && navLink('/admin', 'Admin')}

              {isAuthenticated ? (
                <div className="flex items-center gap-3 pl-3 border-l border-white/20">
                  <div className="text-right hidden md:block leading-tight">
                    <p className="text-white text-sm font-bold">
                      {user.fullName || user.email}
                    </p>
                    <p className="text-white/55 text-[11px] font-bold tracking-wide uppercase">
                      {user.role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-white text-aiesec text-sm font-extrabold px-4 py-2 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Log in
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* ---- Routed page ---- */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* ---- Footer ---- */}
      <footer className="border-t border-line bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-ink-soft">
            Global AIESEC News Platform
          </p>
          <p className="text-xs text-ink-soft/70">
            Built for AIESEC - entity updates, shared globally.
          </p>
        </div>
      </footer>
    </div>
  );
}
