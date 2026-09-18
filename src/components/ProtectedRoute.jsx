import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, HOME_BY_ROLE } from '../auth-context';
import DriverProfileRecovery from '../pages/driver/DriverProfileRecovery';

export default function ProtectedRoute({ allowedRole, children }) {
  const { loading, isAuthenticated, role, session, profile } = useAuth();

  // Session exists but profile not loaded yet — wait instead of bouncing to /login
  const waitingForProfile = Boolean(session?.user) && !profile && !loading;

  if (allowedRole === 'driver' && !loading && session?.user && profile?.id !== session.user.id) {
    return <DriverProfileRecovery />;
  }

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
