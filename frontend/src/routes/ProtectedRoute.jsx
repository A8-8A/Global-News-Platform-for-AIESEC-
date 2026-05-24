// Route guard. Wraps routes that require a session and, optionally,
// a specific role.
//
// Usage:
//   <ProtectedRoute>            ... any logged-in user
//   <ProtectedRoute role="MCP"> ... only MCPs
//   <ProtectedRoute role="ADMIN"> ... only admins

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, user, loading } = useAuth();

  // Still checking the stored token - don't flash a redirect.
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role for this route.
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
