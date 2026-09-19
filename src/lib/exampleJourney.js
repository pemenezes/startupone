export const EXAMPLE_STORAGE_KEY = 'comfy:example-journey:v1';
const CHANGE_EVENT = 'comfy:example-journey-change';

export const EXAMPLE_ROUTE = Object.freeze({
  name: 'Centro → Campus Comfy',
  company: 'Comfy',
  departure: '07:30',
  destination: 'Campus Comfy',
  driver: 'Carlos Roberto',
  vehicle: 'Van · ABC-1D23',
});

export const EXAMPLE_STOPS = Object.freeze([
  { id: 1, name: 'Praça da República', position: [-23.5431, -46.6427], passengerIds: ['ana', 'bruno'] },
  { id: 2, name: 'Avenida Paulista', position: [-23.5614, -46.6559], passengerIds: ['carla'] },
  { id: 3, name: 'Estação Paraíso', position: [-23.5757, -46.6405], passengerIds: ['diego'] },
  { id: 4, name: 'Campus Comfy', position: [-23.5873, -46.6352], passengerIds: [], destination: true },
]);

export const EXAMPLE_PASSENGERS = Object.freeze([
  { id: 'ana', name: 'Ana Silva', stopId: 1, address: 'Praça da República, Centro' },
  { id: 'bruno', name: 'Bruno Costa', stopId: 1, address: 'Rua do Arouche, Centro' },
  { id: 'carla', name: 'Carla Mendes', stopId: 2, address: 'Avenida Paulista, Bela Vista' },
  { id: 'diego', name: 'Diego Oliveira', stopId: 3, address: 'Rua Vergueiro, Paraíso' },
]);

export const EXAMPLE_PASSENGER_ID = 'ana';

export function initialExampleJourney() {
  return { startedAt: null, completedAt: null, arrivedStops: [], statuses: {}, history: [] };
}

export function examplePassengerStatus(state, passengerId) {
  return state.statuses[passengerId] || 'expected';
}

export function exampleCounts(state) {
  return EXAMPLE_PASSENGERS.reduce((counts, passenger) => {
    counts[examplePassengerStatus(state, passenger.id)] += 1;
    return counts;
  }, { expected: 0, boarded: 0, absent: 0 });
}

export function exampleActiveStop(state) {
  const pending = EXAMPLE_PASSENGERS.find((passenger) => examplePassengerStatus(state, passenger.id) === 'expected');
  return pending ? pending.stopId : EXAMPLE_STOPS.length;
}

export function reduceExampleJourney(state, action) {
  if (action.type === 'reset') return initialExampleJourney();
  if (action.type === 'start') {
    if (state.startedAt) return state;
    return { ...state, startedAt: action.at };
  }
  if (!state.startedAt || state.completedAt) return state;

  if (action.type === 'arrive') {
    if (action.stopId !== exampleActiveStop(state) || state.arrivedStops.includes(action.stopId)) return state;
    return { ...state, arrivedStops: [...state.arrivedStops, action.stopId] };
  }

  if (action.type === 'record') {
    const passenger = EXAMPLE_PASSENGERS.find((item) => item.id === action.passengerId);
    if (!passenger || !['boarded', 'absent'].includes(action.status)) return state;
    const previous = examplePassengerStatus(state, passenger.id);
    if (previous === action.status) return state;
    const correction = previous !== 'expected';
    if (!correction && (passenger.stopId !== exampleActiveStop(state) || !state.arrivedStops.includes(passenger.stopId))) return state;
    return {
      ...state,
      statuses: { ...state.statuses, [passenger.id]: action.status },
      history: [...state.history, { passengerId: passenger.id, previous, status: action.status, at: action.at }],
    };
  }

  if (action.type === 'complete') {
    if (exampleCounts(state).expected > 0 || !state.arrivedStops.includes(EXAMPLE_STOPS.length)) return state;
    return { ...state, completedAt: action.at };
  }
  return state;
}

let cachedRaw;
let cachedState;

function readStoredExample() {
  if (typeof window === 'undefined') return initialExampleJourney();
  let raw;
  try { raw = window.localStorage.getItem(EXAMPLE_STORAGE_KEY); } catch { raw = null; }
  if (raw === cachedRaw && cachedState) return cachedState;
  cachedRaw = raw;
  if (!raw) {
    cachedState = initialExampleJourney();
    return cachedState;
  }
  try {
    const parsed = JSON.parse(raw);
    cachedState = {
      startedAt: typeof parsed.startedAt === 'string' ? parsed.startedAt : null,
      completedAt: typeof parsed.completedAt === 'string' ? parsed.completedAt : null,
      arrivedStops: Array.isArray(parsed.arrivedStops) ? parsed.arrivedStops : [],
      statuses: parsed.statuses && typeof parsed.statuses === 'object' ? parsed.statuses : {},
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    cachedState = initialExampleJourney();
  }
  return cachedState;
}

export function getExampleJourney() {
  return readStoredExample();
}

export function subscribeExampleJourney(listener) {
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

export function dispatchExampleJourney(action) {
  const current = readStoredExample();
  const next = reduceExampleJourney(current, { ...action, at: new Date().toISOString() });
  if (next === current) return false;
  try {
    const raw = JSON.stringify(next);
    window.localStorage.setItem(EXAMPLE_STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedState = next;
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}
