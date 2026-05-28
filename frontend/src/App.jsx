// Top-level route table.
//
// Route map:
//   /                 Landing           public, full-bleed (own nav)
//   /feed             Feed              public (approved posts)
//   /feed/:id         PostDetail        public (article + comments)
//   /login            Login             public — "Sign in with EXPA"
//   /auth/callback    OAuthCallback     public — OAuth redirect lands here
//   /compose          ComposePost       MCP only
//   /admin/login      AdminLogin        public, full-bleed
//   /admin            AdminDashboard    ADMIN only, full-bleed (own chrome)
//   *                 NotFound          inside Layout

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './routes/ProtectedRoute';

import Landing from './pages/Landing';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import ComposePost from './pages/ComposePost';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Full-bleed routes — outside the shared Layout chrome */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Inside the shared Layout (top nav + footer) */}
      <Route element={<Layout />}>
        <Route path="/feed" element={<Feed />} />
        <Route path="/feed/:id" element={<PostDetail />} />
        <Route
          path="/compose"
          element={
            <ProtectedRoute role="MCP">
              <ComposePost />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
