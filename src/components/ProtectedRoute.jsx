import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, HOME_BY_ROLE } from '../AuthContext';

export default function ProtectedRoute({ allowedRole, children }) {
  const { loading, isAuthenticated, role } = useAuth();

  if (loading) {
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
