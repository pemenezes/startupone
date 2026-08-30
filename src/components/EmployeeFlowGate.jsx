import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth-context';
import { useTrip } from '../TripContext';

/**
 * Redirects employees through onboarding / route pick before trip screens.
 */
export default function EmployeeFlowGate({ children }) {
  const location = useLocation();
  const { profile } = useAuth();
  const { loading, onboardingComplete, hasActiveTrip } = useTrip();

  const path = location.pathname;
  const isOnboarding = path.startsWith('/employee/onboarding');

  if (loading && !isOnboarding) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Carregando sua viagem...
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

  if (onboardingComplete && !hasActiveTrip) {
    const allowedWithoutTrip =
      isOnboarding ||
      path === '/employee/credits' ||
      path === '/employee/profile' ||
      path === '/employee/alternative';

    if (!allowedWithoutTrip && path !== '/employee/onboarding/route') {
      // Home can render empty CTA; track/cancel/review must redirect to route pick
      if (path.startsWith('/employee/track') || path.startsWith('/employee/cancel') || path.startsWith('/employee/review') || path.startsWith('/employee/driver-profile')) {
        return <Navigate to="/employee/onboarding/route" replace />;
      }
    }
  }

  if (hasActiveTrip && isOnboarding && path.includes('/onboarding/route') === false) {
    // Allow finishing route change via onboarding/route only; other onboarding steps skip if complete
    if (path.includes('/onboarding/company') || path.includes('/onboarding/addresses')) {
      return <Navigate to="/employee" replace />;
    }
  }

  return children;
}
