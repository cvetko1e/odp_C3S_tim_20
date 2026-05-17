import { PostDetailsPage } from "./pages/posts/PostDetailsPage";
import { CreatePostPage } from "./pages/posts/CreatePostPage";
import { EditPostPage } from "./pages/posts/EditPostPage";
import { UserProfilePage } from "./pages/user/UserProfilePage";
import { FollowersPage } from "./pages/follow/FollowersPage";
import { FollowingPage } from "./pages/follow/FollowingPage";

import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";

import LoginPage    from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFoundPage from "./pages/not_found/NotFoundPage";

import UserDashboard from "./pages/user/UserDashboard";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/UsersPage";
import AdminCommunitiesPage from "./pages/admin/AdminCommunitiesPage";
import AdminTagsPage from "./pages/admin/AdminTagsPage";
import AdminAuditLogPage from "./pages/admin/AdminAuditLogPage";

import CommunitiesPage from "./pages/communities/CommunitiesPage";
import MyCommunitiesPage from "./pages/communities/MyCommunitiesPage";
import CreateCommunityPage from "./pages/communities/CreateCommunityPage";
import CommunityDetailsPage from "./pages/communities/CommunityDetailsPage";


export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User routes */}
       <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
       <Route path="/my-communities" element={<ProtectedRoute requiredRole="user"><MyCommunitiesPage /></ProtectedRoute>} />
      <Route path="/communities/create" element={<ProtectedRoute requiredRole="user"><CreateCommunityPage /></ProtectedRoute>} />
          <Route path="/communities/:id" element={<ProtectedRoute requiredRole="user"><CommunityDetailsPage /></ProtectedRoute>} />

          {/* Post routes */}
          <Route path="/posts/:id" element={<ProtectedRoute requiredRole="user"><PostDetailsPage /></ProtectedRoute>} />
          <Route path="/communities/:communityId/posts/create" element={<ProtectedRoute requiredRole="user"><CreatePostPage /></ProtectedRoute>} />
          <Route path="/posts/edit/:id" element={<ProtectedRoute requiredRole="user"><EditPostPage /></ProtectedRoute>} />


      {/* Profile & follow routes */}
          <Route path="/users/:id" element={<ProtectedRoute requiredRole="user"><UserProfilePage /></ProtectedRoute>} />
          <Route path="/users/:id/followers" element={<ProtectedRoute requiredRole="user"><FollowersPage /></ProtectedRoute>} />
          <Route path="/users/:id/following" element={<ProtectedRoute requiredRole="user"><FollowingPage /></ProtectedRoute>} />


      {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/communities" element={<ProtectedRoute requiredRole="admin"><AdminCommunitiesPage /></ProtectedRoute>} />
          <Route path="/admin/tags" element={<ProtectedRoute requiredRole="admin"><AdminTagsPage /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute requiredRole="admin"><AdminAuditLogPage /></ProtectedRoute>} />


      {/* Public routes */}
      <Route path="/communities" element={<CommunitiesPage />} />

      <Route path="/"    element={<Navigate to="/login" replace />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
