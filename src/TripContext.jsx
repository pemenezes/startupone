import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { fetchActiveTrip, assignRouteTrip, cancelActiveTrip } from './lib/trips';

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const { profile, role } = useAuth();
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshTrip = useCallback(async () => {
    if (!profile?.id || role !== 'employee') {
      setActiveTrip(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const trip = await fetchActiveTrip(profile.id);
      setActiveTrip(trip);
      return trip;
    } catch (err) {
      console.error('Failed to load active trip', err);
      setActiveTrip(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [profile?.id, role]);

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  const selectRoute = async (routeId) => {
    if (!profile?.id) throw new Error('Usuário não autenticado');
    const trip = await assignRouteTrip(profile.id, routeId);
    setActiveTrip(trip);
    return trip;
  };

  const cancelTrip = async () => {
    if (!activeTrip?.id) return null;
    await cancelActiveTrip(activeTrip.id);
    setActiveTrip(null);
    return true;
  };

  const onboardingComplete = Boolean(
    profile?.company_id && profile?.home_address?.trim() && profile?.work_address?.trim()
  );

  const value = {
    activeTrip,
    loading,
    refreshTrip,
    selectRoute,
    cancelTrip,
    onboardingComplete,
    hasActiveTrip: Boolean(activeTrip?.route),
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used within a TripProvider');
  return context;
}
