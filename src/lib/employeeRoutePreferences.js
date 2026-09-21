const boarding = (id, name, position) => ({ id, name, position, kind: 'boarding', destination: false });
const destination = (id, name, position) => ({ id, name, position, kind: 'destination', destination: true });

export const EMPLOYEE_ROUTE_OPTIONS = [
  {
    id: 'comfy-centro-ida', code: 'CF-01', direction: 'outbound',
    name: 'Centro → Campus Comfy', boarding_stop: 'Praça da República',
    destination_label: 'Campus Comfy', typical_start_time: '07:30',
    driver: { name: 'Carlos Roberto', vehicle: { label: 'Van Sprinter · ABC-1D23' }, rating: { average: 4.9 } },
    stops: [
      boarding('centro', 'Praça da República', [-23.5431, -46.6427]),
      boarding('roosevelt', 'Praça Roosevelt', [-23.5482, -46.6478]),
      boarding('paulista', 'Avenida Paulista', [-23.5613, -46.6552]),
      destination('campus', 'Campus Comfy', [-23.5695, -46.6601]),
    ],
  },
  {
    id: 'comfy-pinheiros-ida', code: 'CF-02', direction: 'outbound',
    name: 'Pinheiros → Campus Comfy', boarding_stop: 'Largo da Batata',
    destination_label: 'Campus Comfy', typical_start_time: '07:15',
    driver: { name: 'Fernanda Lopes', vehicle: { label: 'Van Executiva · GHI-4821' }, rating: { average: 4.8 } },
    stops: [
      boarding('batata', 'Largo da Batata', [-23.5665, -46.6930]),
      boarding('reboucas', 'Avenida Rebouças', [-23.5618, -46.6741]),
      boarding('consolacao', 'Rua da Consolação', [-23.5575, -46.6607]),
      destination('campus-pinheiros', 'Campus Comfy', [-23.5695, -46.6601]),
    ],
  },
  {
    id: 'comfy-centro-volta', code: 'CF-03', direction: 'return',
    name: 'Campus Comfy → Centro', boarding_stop: 'Campus Comfy',
    destination_label: 'Praça da República', typical_start_time: '18:10',
    driver: { name: 'Carlos Roberto', vehicle: { label: 'Van Sprinter · ABC-1D23' }, rating: { average: 4.9 } },
    stops: [
      boarding('campus-volta', 'Campus Comfy', [-23.5695, -46.6601]),
      boarding('paulista-volta', 'Avenida Paulista', [-23.5613, -46.6552]),
      boarding('roosevelt-volta', 'Praça Roosevelt', [-23.5482, -46.6478]),
      destination('centro-volta', 'Praça da República', [-23.5431, -46.6427]),
    ],
  },
  {
    id: 'comfy-pinheiros-volta', code: 'CF-04', direction: 'return',
    name: 'Campus Comfy → Pinheiros', boarding_stop: 'Campus Comfy',
    destination_label: 'Largo da Batata', typical_start_time: '18:20',
    driver: { name: 'Fernanda Lopes', vehicle: { label: 'Van Executiva · GHI-4821' }, rating: { average: 4.8 } },
    stops: [
      boarding('campus-pinheiros-volta', 'Campus Comfy', [-23.5695, -46.6601]),
      boarding('consolacao-volta', 'Rua da Consolação', [-23.5575, -46.6607]),
      boarding('reboucas-volta', 'Avenida Rebouças', [-23.5618, -46.6741]),
      destination('batata-volta', 'Largo da Batata', [-23.5665, -46.6930]),
    ],
  },
];

const storageKey = (userId) => `comfy:employee-route:${userId || 'local'}`;

export function readEmployeeRoutePreferences(userId) {
  if (typeof window === 'undefined') return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey(userId)) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

export function saveEmployeeRoutePreference(userId, direction, routeId, weekdays) {
  const current = readEmployeeRoutePreferences(userId);
  const next = { ...current, [direction]: { routeId, weekdays }, activeDirection: direction };
  try { window.localStorage.setItem(storageKey(userId), JSON.stringify(next)); } catch { /* Keep the current view usable. */ }
  window.dispatchEvent(new Event('comfy:employee-route-change'));
  return next;
}

export function selectedEmployeeRoute(userId) {
  const preferences = readEmployeeRoutePreferences(userId);
  const routeId = preferences[preferences.activeDirection]?.routeId;
  return EMPLOYEE_ROUTE_OPTIONS.find((route) => route.id === routeId) || null;
}
