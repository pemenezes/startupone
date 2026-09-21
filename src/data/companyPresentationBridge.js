import { PRESENTATION_PASSENGERS, PRESENTATION_STOPS, presentationStopIndex } from '../lib/presentationMobility.js';
import { adminEmployees, adminOccurrences, adminRoutes } from './presentationCompanyData.js';

const passengerIds = ['E101', 'E102', 'E103', 'E104'];
const withHistory = (route) => ({
  ...route,
  history: route.history || Array.from({ length: 30 }, (_, index) => ({
    day: index + 1,
    occupancy: Math.max(12, Math.min(100, Number(route.historyBase ?? 60) + (((index * 7 + route.id.length * 3) % 19) - 9))),
  })),
});

export function presentationAdminRoute(journey) {
  const template = adminRoutes[0];
  const arrivedCount = journey.arrivedStops.length;
  const stopIndex = presentationStopIndex(journey);
  const nextStop = PRESENTATION_STOPS[stopIndex];
  const lastStop = PRESENTATION_STOPS.find((stop) => stop.id === journey.arrivedStops.at(-1));
  const passengers = PRESENTATION_PASSENGERS.map((person, index) => ({
    id: passengerIds[index],
    name: person.passenger_name,
    status: journey.statuses[person.passenger_id] || 'expected',
    boardingStop: PRESENTATION_STOPS.find((stop) => stop.id === person.boarding_stop_id)?.name,
  }));

  return {
    ...template,
    status: journey.completed ? 'completed' : journey.started || arrivedCount ? 'in_progress' : 'planned',
    progress: journey.completed ? 100 : Math.round((arrivedCount / PRESENTATION_STOPS.length) * 100),
    nextStop: journey.completed ? 'Destino concluído' : nextStop?.name || template.nextStop,
    etaMinutes: journey.completed ? 0 : Math.max(3, 18 - stopIndex * 5),
    position: lastStop?.position || PRESENTATION_STOPS[0].position,
    stops: PRESENTATION_STOPS.map((stop) => ({ id: stop.id, name: stop.name, arrived: journey.arrivedStops.includes(stop.id) })),
    passengers,
    todayAbsences: passengers.filter((person) => person.status === 'absent').length,
  };
}

export function composeCompanyPresentation(baseData, journey) {
  const primary = presentationAdminRoute(journey);
  const sampleRoutes = adminRoutes.slice(1).map((route) => withHistory((baseData.routes || []).find((item) => item.id === route.id) || route));
  const routes = [withHistory(primary), ...sampleRoutes, ...(baseData.routes || []).filter((route) => !adminRoutes.some((sample) => sample.id === route.id))];
  const employees = [...adminEmployees, ...(baseData.employees || []).filter((person) => !adminEmployees.some((sample) => sample.id === person.id))];
  const occurrences = [
    ...adminOccurrences,
    ...(primary.todayAbsences ? [{ id: 'CF-01:absence-today', routeId: primary.id, type: 'Ausência de hoje', detail: `${primary.todayAbsences} ausência(s) confirmada(s) nesta jornada.` }] : []),
    ...(baseData.occurrences || []).filter((item) => !adminOccurrences.some((sample) => sample.id === item.id)),
  ];
  return { ...baseData, routes, employees, occurrences };
}
