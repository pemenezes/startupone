import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import {
  cancelTodayForSubscription,
  fetchEmployeeSubscriptions,
  fetchTodayRides,
  upsertSubscription,
} from './lib/subscriptions';
import { fetchEmployeeJourneyStatuses } from './lib/driverAttendance';
import { todayISO } from './lib/schedule';

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const { profile, role } = useAuth();
  const profileId = profile?.id;
  const [subscriptions, setSubscriptions] = useState([]);
  const [todayRides, setTodayRides] = useState([]);
  const [journeyStatuses, setJourneyStatuses] = useState([]);
  const [journeyStatusError, setJourneyStatusError] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshTrip = useCallback(async () => {
    if (!profileId || role !== 'employee') {
      setSubscriptions([]);
      setTodayRides([]);
      setJourneyStatuses([]);
      setJourneyStatusError(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const [subs, rides] = await Promise.all([
        fetchEmployeeSubscriptions(profileId),
        fetchTodayRides(profileId),
      ]);
      setSubscriptions(subs);
      setTodayRides(rides);
      try {
        const statuses = await fetchEmployeeJourneyStatuses(profileId, todayISO());
        setJourneyStatuses(statuses);
        setJourneyStatusError(null);
        return { subscriptions: subs, todayRides: rides, journeyStatuses: statuses };
      } catch (statusError) {
        console.error('Failed to load journey status', statusError);
        setJourneyStatuses([]);
        setJourneyStatusError(statusError);
        return { subscriptions: subs, todayRides: rides, journeyStatuses: [] };
      }
    } catch (err) {
      console.error('Failed to load subscriptions', err);
      setSubscriptions([]);
      setTodayRides([]);
      setJourneyStatuses([]);
      setJourneyStatusError(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [profileId, role]);

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  useEffect(() => {
    if (role !== 'employee') return undefined;
    const timer = window.setInterval(refreshTrip, 30000);
    window.addEventListener('focus', refreshTrip);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshTrip);
    };
  }, [refreshTrip, role]);

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
    journeyStatuses,
    journeyStatusError,
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
