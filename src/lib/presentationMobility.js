import { activeStopIndex } from './mobilityState.js';

export const PRESENTATION_ROUTE = {
  name: 'Centro → Campus Comfy',
  driver: 'Carlos Roberto',
  vehicle: 'Van Sprinter · ABC-1D23',
};

export const PRESENTATION_STOPS = [
  { id: 'centro', name: 'Praça da República', position: [-23.5431, -46.6427], kind: 'boarding', destination: false },
  { id: 'roosevelt', name: 'Praça Roosevelt', position: [-23.5482, -46.6478], kind: 'boarding', destination: false },
  { id: 'paulista', name: 'Avenida Paulista', position: [-23.5613, -46.6552], kind: 'boarding', destination: false },
  { id: 'campus', name: 'Campus Comfy', position: [-23.5695, -46.6601], kind: 'destination', destination: true },
];

export const PRESENTATION_PASSENGERS = [
  { passenger_id: 'ana', passenger_name: 'Ana Silva', boarding_stop_id: 'centro' },
  { passenger_id: 'bruno', passenger_name: 'Bruno Costa', boarding_stop_id: 'centro' },
  { passenger_id: 'carla', passenger_name: 'Carla Mendes', boarding_stop_id: 'roosevelt' },
  { passenger_id: 'diego', passenger_name: 'Diego Oliveira', boarding_stop_id: 'paulista' },
];

const STORAGE_KEY = 'comfy:journey-presentation:v1';
const CHANGE_EVENT = 'comfy:journey-presentation-change';
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
const initial = () => ({ date: today(), arrivedStops: [], statuses: {}, completed: false, started: false });
let cachedRaw;
let cachedState;

export function readPresentationJourney() {
  if (typeof window === 'undefined') return initial();
  let raw;
  try { raw = window.localStorage.getItem(STORAGE_KEY); } catch { raw = null; }
  if (raw === cachedRaw && cachedState && cachedState.date === today()) return cachedState;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    cachedState = parsed.date === today() && Array.isArray(parsed.arrivedStops) && parsed.statuses
      ? { date: parsed.date, arrivedStops: parsed.arrivedStops, statuses: parsed.statuses, completed: Boolean(parsed.completed), started: Boolean(parsed.started || parsed.arrivedStops.length || parsed.completed) }
      : initial();
  } catch {
    cachedState = initial();
  }
  return cachedState;
}

export function presentationPassengers(state) {
  return PRESENTATION_PASSENGERS.map((passenger) => ({
    ...passenger, status: state.statuses[passenger.passenger_id] || 'expected',
  }));
}

export function presentationStopIndex(state) {
  return activeStopIndex(
    PRESENTATION_STOPS,
    state.arrivedStops.map((route_stop_id) => ({ route_stop_id })),
    presentationPassengers(state),
  );
}

export function reducePresentationJourney(state, action) {
  if (action.type === 'restart') return initial();
  if (state.completed) return state;
  if (action.type === 'start') return { ...state, started: true };
  const stop = PRESENTATION_STOPS[presentationStopIndex(state)];
  if (action.type === 'arrive' && action.stopId === stop?.id && !state.arrivedStops.includes(stop.id)) {
    return {
      ...state,
      arrivedStops: [...state.arrivedStops, stop.id],
      completed: Boolean(stop.destination),
    };
  }
  if (action.type === 'attendance' && ['boarded', 'absent'].includes(action.status)) {
    const passenger = PRESENTATION_PASSENGERS.find((item) => item.passenger_id === action.passengerId);
    if (!passenger || !state.arrivedStops.includes(passenger.boarding_stop_id)) return state;
    return { ...state, statuses: { ...state.statuses, [passenger.passenger_id]: action.status } };
  }
  return state;
}

export function updatePresentationJourney(action) {
  const previous = readPresentationJourney();
  const next = reducePresentationJourney(previous, action);
  if (next === previous) return next;
  const raw = JSON.stringify(next);
  try { window.localStorage.setItem(STORAGE_KEY, raw); } catch { /* In-memory state still works. */ }
  cachedRaw = raw;
  cachedState = next;
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return next;
}

export function subscribePresentationJourney(listener) {
  const onStorage = (event) => { if (event.key === STORAGE_KEY) listener(); };
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}
