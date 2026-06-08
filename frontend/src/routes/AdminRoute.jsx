import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const location = useLocation();

  console.log('[AdminRoute] Check:', {
    loading,
    isAuthenticated,
    isAdmin,
    role: user?.role,
    path: location.pathname,
  });

  // Step 1: Wait for token verification to complete
  // Never make routing decisions while loading
  if (loading) {
    console.log('[AdminRoute] Waiting for auth...');
    return <LoadingSpinner fullScreen />;
  }

  // Step 2: Not logged in at all → go to login
  if (!isAuthenticated) {
    console.log('[AdminRoute] Not authenticated → /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Step 3: Logged in but not admin → go home
  if (!isAdmin) {
    console.log('[AdminRoute] Not admin (role:', user?.role, ') → /');
    return <Navigate to="/" replace />;
  }

  // Step 4: Admin confirmed → render
  console.log('[AdminRoute] ✅ Access granted for admin:', user?.email);
  return children;
}