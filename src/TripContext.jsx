import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import {
  cancelTodayForSubscription,
  fetchEmployeeSubscriptions,
  fetchTodayRides,
  upsertSubscription,
} from './lib/subscriptions';

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const { profile, role } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [todayRides, setTodayRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshTrip = useCallback(async () => {
    if (!profile?.id || role !== 'employee') {
      setSubscriptions([]);
      setTodayRides([]);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const [subs, rides] = await Promise.all([
        fetchEmployeeSubscriptions(profile.id),
        fetchTodayRides(profile.id),
      ]);
      setSubscriptions(subs);
      setTodayRides(rides);
      return { subscriptions: subs, todayRides: rides };
    } catch (err) {
      console.error('Failed to load subscriptions', err);
      setSubscriptions([]);
      setTodayRides([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, [profile?.id, role]);

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  const selectRoute = async (routeId, weekdays) => {
    if (!profile?.id) throw new Error('Usuário não autenticado');
    await upsertSubscription(profile.id, routeId, weekdays);
    return refreshTrip();
  };

  const cancelTrip = async (routeId) => {
    if (!profile?.id || !routeId) return null;
    await cancelTodayForSubscription(profile.id, routeId);
    await refreshTrip();
    return true;
  };

  const expectedToday = todayRides.filter((r) => r.expectedToday);
  const primaryToday = expectedToday[0] || null;

  const onboardingComplete = Boolean(
    profile?.company_id &&
      profile?.region_id &&
      profile?.home_address?.trim() &&
      profile?.work_address?.trim()
  );

  const value = {
    subscriptions,
    todayRides,
    expectedToday,
    /** @deprecated use primaryToday / expectedToday — kept for older screens */
    activeTrip: primaryToday
      ? {
          id: primaryToday.id,
          route_id: primaryToday.route_id,
          route: primaryToday.route,
          status: 'active',
        }
      : null,
    loading,
    refreshTrip,
    selectRoute,
    cancelTrip,
    onboardingComplete,
    hasSubscription: subscriptions.length > 0,
    hasActiveTrip: expectedToday.length > 0,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used within a TripProvider');
  return context;
}
