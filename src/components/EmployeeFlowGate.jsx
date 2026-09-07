import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth-context';
import { useTrip } from '../TripContext';

/**
 * Redirects employees through onboarding / route subscription before trip screens.
 */
export default function EmployeeFlowGate({ children }) {
  const location = useLocation();
  const { profile } = useAuth();
  const { loading, onboardingComplete, hasSubscription, hasActiveTrip } = useTrip();

  const path = location.pathname;
  const isOnboarding = path.startsWith('/employee/onboarding');

  if (loading && !isOnboarding) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Carregando seu plano de rotas...
      </div>
    );
  }

  if (!profile?.company_id && !path.includes('/onboarding/company')) {
    return <Navigate to="/employee/onboarding/company" replace />;
  }

  if (
    profile?.company_id &&
    (!profile.home_address?.trim() || !profile.work_address?.trim()) &&
    !path.includes('/onboarding/addresses') &&
    !path.includes('/onboarding/company')
  ) {
    return <Navigate to="/employee/onboarding/addresses" replace />;
  }

  if (
    profile?.company_id &&
    profile.home_address?.trim() &&
    profile.work_address?.trim() &&
    !profile?.region_id &&
    !path.includes('/onboarding/region') &&
    !path.includes('/onboarding/addresses') &&
    !path.includes('/onboarding/company')
  ) {
    return <Navigate to="/employee/onboarding/region" replace />;
  }

  if (onboardingComplete && !hasSubscription) {
    const allowed =
      isOnboarding ||
      path === '/employee' ||
      path === '/employee/credits' ||
      path.startsWith('/employee/credits/') ||
      path === '/employee/profile' ||
      path === '/employee/help' ||
      path === '/employee/security' ||
      path === '/employee/notifications' ||
      path === '/employee/alternative';

    if (
      !allowed &&
      (path.startsWith('/employee/track') ||
        path.startsWith('/employee/cancel') ||
        path.startsWith('/employee/review') ||
        path.startsWith('/employee/driver-profile'))
    ) {
      return <Navigate to="/employee/onboarding/route" replace />;
    }
  }

  if (hasSubscription && isOnboarding) {
    if (path.includes('/onboarding/company') || path.includes('/onboarding/addresses') || path.includes('/onboarding/region')) {
      return <Navigate to="/employee" replace />;
    }
  }

  // Track/cancel only when expected today
  if (
    hasSubscription &&
    !hasActiveTrip &&
    (path.startsWith('/employee/track') || path.startsWith('/employee/cancel'))
  ) {
    return <Navigate to="/employee" replace />;
  }

  return children;
}
