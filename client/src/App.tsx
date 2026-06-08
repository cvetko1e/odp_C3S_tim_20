import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";
import { Layout } from "./components/layout/Layout";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFoundPage from "./pages/not_found/NotFoundPage";
import ForbiddenPage from "./pages/not_found/ForbiddenPage";

import UserDashboard from "./pages/user/UserDashboard";
import { UserProfilePage } from "./pages/user/UserProfilePage";
import { FollowersPage } from "./pages/follow/FollowersPage";
import { FollowingPage } from "./pages/follow/FollowingPage";

import CommunitiesPage from "./pages/communities/CommunitiesPage";
import MyCommunitiesPage from "./pages/communities/MyCommunitiesPage";
import CreateCommunityPage from "./pages/communities/CreateCommunityPage";
import CommunityDetailsPage from "./pages/communities/CommunityDetailsPage";

import { PostDetailsPage } from "./pages/posts/PostDetailsPage";
import { CreatePostPage } from "./pages/posts/CreatePostPage";
import { EditPostPage } from "./pages/posts/EditPostPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/UsersPage";
import AdminCommunitiesPage from "./pages/admin/AdminCommunitiesPage";
import AdminTagsPage from "./pages/admin/AdminTagsPage";
import AdminAuditLogPage from "./pages/admin/AdminAuditLogPage";
import AdminHealthPage from "./pages/admin/AdminHealthPage";

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public / guest routes */}
      <Route path="/communities" element={<Layout><CommunitiesPage /></Layout>} />
      <Route path="/communities/:id" element={<Layout><CommunityDetailsPage /></Layout>} />
      <Route path="/posts/:id" element={<Layout><PostDetailsPage /></Layout>} />
      <Route path="/users/:id" element={<Layout><UserProfilePage /></Layout>} />

      {/* User routes */}
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/my-communities" element={<ProtectedRoute requiredRole="user"><MyCommunitiesPage /></ProtectedRoute>} />
      <Route path="/communities/create" element={<ProtectedRoute requiredRole="user"><CreateCommunityPage /></ProtectedRoute>} />
      <Route path="/communities/:communityId/posts/create" element={<ProtectedRoute requiredRole="user"><CreatePostPage /></ProtectedRoute>} />
      <Route path="/posts/edit/:id" element={<ProtectedRoute requiredRole="user"><EditPostPage /></ProtectedRoute>} />
      <Route path="/users/:id/followers" element={<ProtectedRoute requiredRole="user"><FollowersPage /></ProtectedRoute>} />
      <Route path="/users/:id/following" element={<ProtectedRoute requiredRole="user"><FollowingPage /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/admin/communities" element={<ProtectedRoute requiredRole="admin"><AdminCommunitiesPage /></ProtectedRoute>} />
      <Route path="/admin/tags" element={<ProtectedRoute requiredRole="admin"><AdminTagsPage /></ProtectedRoute>} />
      <Route path="/admin/audit" element={<ProtectedRoute requiredRole="admin"><AdminAuditLogPage /></ProtectedRoute>} />
      <Route path="/admin/health" element={<ProtectedRoute requiredRole="admin"><AdminHealthPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/communities" replace />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
