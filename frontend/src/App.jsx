import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, ProtectedUserRoute } from './components/auth/ProtectedRoute';

// Public Catalog Pages
import { HomePage } from './pages/public/HomePage';
import { CollectionDetailPage } from './pages/public/CollectionDetailPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Common Auth & User Dashboard Pages
import { LoginPage } from './pages/auth/LoginPage';
import { UserDashboardPage } from './pages/user/UserDashboardPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCollectionsPage } from './pages/admin/AdminCollectionsPage';
import { AdminCollectionNewPage } from './pages/admin/AdminCollectionNewPage';
import { AdminCollectionEditPage } from './pages/admin/AdminCollectionEditPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Catalog Routes (No login required) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/collection/:slug" element={<CollectionDetailPage />} />

        {/* Common Authentication (Login & Signup for all users) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Navigate to="/login?mode=signup" replace />} />
        <Route path="/register" element={<Navigate to="/login?mode=signup" replace />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

        {/* Normal User Dashboard */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedUserRoute>
              <UserDashboardPage />
            </ProtectedUserRoute>
          }
        />
        <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />

        {/* Protected Admin Routes (Restricted strictly to authorized Admin) */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/collections"
          element={
            <ProtectedRoute>
              <AdminCollectionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/collections/new"
          element={
            <ProtectedRoute>
              <AdminCollectionNewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/collections/:id/edit"
          element={
            <ProtectedRoute>
              <AdminCollectionEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/collections/:id/products"
          element={
            <ProtectedRoute>
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
