import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth-context';
import { fetchDriverAssignments, fetchPassengersForRouteToday } from '../../lib/assignments';
import { todayISO } from '../../lib/schedule';
import { driverDayStatus } from '../../lib/driverSchedule';
import {
  completeDriverJourney,
  fetchDriverJourney,
  journeyDisplayState,
  startDriverJourney,
} from '../../lib/driverJourneys';
import {
  fetchJourneyPassengers,
  recordJourneyPassengerStatus,
} from '../../lib/driverAttendance';
import { DriverContext } from './driver-context';
import { useDriverResource } from './useDriverResource';

export default function DriverProvider({ children }) {
  const { profile } = useAuth();
  const [operationAction, setOperationAction] = useState({ loading: false, error: null });
  const [attendanceAction, setAttendanceAction] = useState({ loading: false, error: null });
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
  const loadOperation = useCallback(async () => {
    if (!assignment) return null;
    return fetchDriverJourney(profile.id, assignment.route_id, day);
  }, [profile.id, assignment, day]);
  const operation = useDriverResource(loadOperation);
  const operationState = journeyDisplayState(operation.data, status);
  const loadAttendance = useCallback(
    () => fetchJourneyPassengers(operation.data?.id),
    [operation.data?.id],
  );
  const attendance = useDriverResource(loadAttendance);

  const runOperation = async (action) => {
    if (operationAction.loading) return null;
    setOperationAction({ loading: true, error: null });
    try {
      const data = await action();
      setOperationAction({ loading: false, error: null });
      operation.refresh();
      return data;
    } catch (error) {
      setOperationAction({ loading: false, error });
      return null;
    }
  };

  const startJourney = () => runOperation(() => startDriverJourney(assignment?.route_id, day));
  const finishJourney = () => runOperation(() => completeDriverJourney(operation.data?.id));
  const recordAttendance = async (passengerId, passengerStatus) => {
    if (attendanceAction.loading) return null;
    setAttendanceAction({ loading: true, error: null });
    try {
      const data = await recordJourneyPassengerStatus(operation.data?.id, passengerId, passengerStatus);
      setAttendanceAction({ loading: false, error: null });
      attendance.refresh();
      return data;
    } catch (error) {
      setAttendanceAction({ loading: false, error });
      return null;
    }
  };

  return (
    <DriverContext.Provider value={{
      journey,
      passengers,
      assignment,
      status,
      day,
      operation,
      operationState,
      operationAction,
      attendance,
      attendanceAction,
      startJourney,
      finishJourney,
      recordAttendance,
    }}>
      {children}
    </DriverContext.Provider>
  );
}
