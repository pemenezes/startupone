export const DEMO_ORIGIN = [-23.55052, -46.633308];

// Illustrative points only; these offsets are not a road-routing engine.
export function createDemoRoute(origin = DEMO_ORIGIN, passengerGroups) {
  const offsets = [[0.003, 0.002], [0.006, -0.001], [0.008, 0.004], [0.011, 0.007]];
  const names = ['Praça de encontro', 'Ponto do bairro', 'Terminal de conexão', 'Sede da empresa'];
  const passengers = passengerGroups
    ? [...passengerGroups.slice(0, 3), []]
    : [['Ana', 'Bruno'], ['Carla'], ['Diego', 'Elisa'], []];
  return offsets.map(([lat, lng], index) => ({
    id: index + 1,
    name: names[index],
    position: [Math.max(-85, Math.min(85, origin[0] + lat)), ((origin[1] + lng + 540) % 360) - 180],
    passengers: passengers[index],
    destination: index === offsets.length - 1,
  }));
}

export function navigationUrl(position, userAgent = globalThis.navigator?.userAgent || '') {
  const coordinates = position.join(',');
  if (/android/i.test(userAgent)) return `geo:${coordinates}?q=${encodeURIComponent(coordinates)}`;
  if (/iPad|iPhone|iPod/i.test(userAgent)) return 'https://maps.apple.com/?' + new URLSearchParams({ daddr: coordinates, dirflg: 'd' });
  return 'https://www.google.com/maps/dir/?' + new URLSearchParams({
    api: '1', destination: coordinates, travelmode: 'driving', dir_action: 'navigate',
  });
}

export const initialJourney = { index: 0, arrived: false, attendance: {}, complete: false };

// Local demonstration only. No attendance is sent to the production backend.
export function advanceJourney(state, action, stops) {
  const stop = stops[state.index];
  if (state.complete || !stop || action.stopId !== stop.id) return state;
  if (action.type === 'arrive') {
    if (state.arrived) return state;
    return { ...state, arrived: true, complete: stop.destination };
  }
  if (action.type !== 'attendance' || !state.arrived || !['boarded', 'absent'].includes(action.status)) return state;
  if (!stop.passengers.includes(action.passenger)) return state;
  const key = `${stop.id}:${action.passenger}`;
  if (state.attendance[key]) return state;
  const attendance = { ...state.attendance, [key]: action.status };
  const finished = stop.passengers.every((name) => attendance[`${stop.id}:${name}`]);
  return { ...state, attendance, index: finished ? state.index + 1 : state.index, arrived: !finished };
}
