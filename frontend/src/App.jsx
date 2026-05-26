// Top-level route table.
//
// Route map:
//   /                 Landing        public - intro + previews, pre-login
//   /feed             Feed           public - the news feed (approved posts)
//   /login            Login          public - "Login with AIESEC"
//   /auth/callback    OAuthCallback  public - OAuth redirect lands here
//   /compose          ComposePost    MCP only
//   /admin/login      AdminLogin     public
//   /admin            AdminDashboard ADMIN only
//
// Landing sits OUTSIDE <Layout> - it has its own full-bleed chrome.
// Everything else renders inside the shared app shell.

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './routes/ProtectedRoute';

import Landing from './pages/Landing';
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
      {/* Standalone landing page - own layout */}
      <Route path="/" element={<Landing />} />

      {/* App shell for everything else */}
      <Route element={<Layout />}>
        <Route path="/feed" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/compose"
          element={
            <ProtectedRoute role="MCP">
              <ComposePost />
            </ProtectedRoute>
          }
        />
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
