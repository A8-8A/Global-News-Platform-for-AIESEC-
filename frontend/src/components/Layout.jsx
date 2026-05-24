// Shared layout: header with role-aware navigation, then the routed page.

import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, isAuthenticated, isMcp, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold text-aiesec text-lg">
            AIESEC News
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-gray-700 hover:text-aiesec">
              Feed
            </Link>

            {/* MCPs get a compose link */}
            {isMcp && (
              <Link to="/compose" className="text-gray-700 hover:text-aiesec">
                New Post
              </Link>
            )}

            {/* Admins get a dashboard link */}
            {isAdmin && (
              <Link to="/admin" className="text-gray-700 hover:text-aiesec">
                Admin
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <span className="text-gray-500">
                  {user.fullName || user.email} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-aiesec"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-aiesec text-white px-3 py-1.5 rounded hover:bg-aiesec-dark"
              >
                Log in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
