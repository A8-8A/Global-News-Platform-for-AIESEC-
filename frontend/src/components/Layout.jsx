// Shared app shell: a white header with the AIESEC logo + nav, the
// routed page, and a plain footer. Used by every page except Landing.

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
          'text-sm font-bold ' +
          (active ? 'text-aiesec' : 'text-ink-soft hover:text-ink')
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-line bg-white">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo className="h-6" />
          </Link>

          <nav className="flex items-center gap-6">
            {navLink('/feed', 'Feed')}
            {isMcp && navLink('/compose', 'New post')}
            {isAdmin && navLink('/admin', 'Admin')}

            {isAuthenticated ? (
              <div className="flex items-center gap-4 pl-6 border-l border-line">
                <div className="text-right hidden md:block leading-tight">
                  <p className="text-sm font-bold text-ink">
                    {user.fullName || user.email}
                  </p>
                  <p className="text-[11px] font-bold tracking-wide uppercase text-ink-soft">
                    {user.role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-bold text-ink-soft hover:text-ink"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary px-4 py-2 text-sm">
                Log in
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Page */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-white">
        <div className="max-w-5xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <Logo className="h-5" />
          <p className="text-xs text-ink-soft">
            Global AIESEC News Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
