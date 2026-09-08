import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth-context';
import { fetchDriverAssignments, fetchPassengersForRouteToday } from '../../lib/assignments';
import { todayISO } from '../../lib/schedule';
import { driverDayStatus } from '../../lib/driverSchedule';
import { DriverContext } from './driver-context';
import { useDriverResource } from './useDriverResource';

export default function DriverProvider({ children }) {
  const { profile } = useAuth();
  const [day, setDay] = useState(() => todayISO());
  useEffect(() => {
    const updateDay = () => setDay(todayISO());
    const timer = window.setInterval(updateDay, 30000);
    window.addEventListener('focus', updateDay);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', updateDay);
    };
  }, []);
  const load = useCallback(async () => {
    const assignments = await fetchDriverAssignments(profile.id);
    if (assignments.length > 1) {
      throw new Error('Há mais de uma rota ativa no seu cadastro. Solicite a revisão da atribuição antes de consultar a jornada.');
    }
    const assignment = assignments[0] || null;
    const date = new Date(`${day}T12:00:00-03:00`);
    const status = driverDayStatus(assignment, date);
    if (status === 'unavailable') {
      throw new Error('Sua rota está indisponível. Atualize a jornada ou consulte a operação.');
    }
    return { assignment, status };
  }, [profile.id, day]);
  const journey = useDriverResource(load);
  const assignment = journey.data?.assignment || null;
  const status = journey.data?.status;
  const loadPassengers = useCallback(async () => {
    if (status !== 'scheduled' || !assignment) return [];
    return fetchPassengersForRouteToday(assignment.route_id, new Date(`${day}T12:00:00-03:00`));
  }, [assignment, status, day]);
  const passengers = useDriverResource(loadPassengers);
  return (
    <DriverContext.Provider value={{ journey, passengers, assignment, status, day }}>
      {children}
    </DriverContext.Provider>
  );
}
