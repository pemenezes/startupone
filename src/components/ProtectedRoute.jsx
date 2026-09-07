import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, HOME_BY_ROLE } from '../auth-context';

export default function ProtectedRoute({ allowedRole, children }) {
  const { loading, isAuthenticated, role, session, profile } = useAuth();

  // Session exists but profile not loaded yet — wait instead of bouncing to /login
  const waitingForProfile = Boolean(session?.user) && !profile && !loading;

  if (loading || waitingForProfile) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    const fallback = HOME_BY_ROLE[role] || '/login';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
