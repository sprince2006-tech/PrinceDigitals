import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../common/LoadingState';

/**
 * Route protection strictly for Administrator routes (/admin/*).
 * Redirects unauthenticated visitors to /login.
 * Redirects normal users to /user/dashboard.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Verifying administrator credentials..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

/**
 * Route protection for Normal User routes (/user/*).
 * Redirects unauthenticated visitors to /login.
 */
export const ProtectedUserRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Verifying account..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
