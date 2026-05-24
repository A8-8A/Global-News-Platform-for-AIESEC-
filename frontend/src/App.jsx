// Top-level route table.
//
// Route map:
//   /                 Feed              public (approved posts)
//   /login            Login             public - "Login with AIESEC"
//   /auth/callback    OAuthCallback     public - OAuth redirect lands here
//   /compose          ComposePost       MCP only
//   /admin/login      AdminLogin        public
//   /admin            AdminDashboard    ADMIN only

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './routes/ProtectedRoute';

import Feed from './pages/Feed';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import ComposePost from './pages/ComposePost';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* MCP only */}
        <Route
          path="/compose"
          element={
            <ProtectedRoute role="MCP">
              <ComposePost />
            </ProtectedRoute>
          }
        />

        {/* Admin only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
