import routeGeometry from './presentationRouteGeometry.json' with { type: 'json' };

// Percursos viários obtidos uma única vez do OSRM/ OpenStreetMap e salvos no projeto.
// A aplicação apenas desenha estas coordenadas; não consulta um serviço de roteamento.
const paths = Object.fromEntries(
  Object.entries(routeGeometry).map(([id, route]) => [id, route.legs.flat()]),
);

export function presentationRoutePath(id) {
  return paths[id] || [];
}

export function presentationRouteForStops(stops) {
  if (!Array.isArray(stops)) return null;
  const entry = Object.entries(routeGeometry).find(([, route]) =>
    route.stops.length === stops.length && route.stops.every((position, index) =>
      Array.isArray(stops[index]?.position) && position.every((value, axis) =>
        Math.abs(value - stops[index].position[axis]) < 0.00001,
      ),
    ),
  );
  if (!entry) return null;
  return { legs: entry[1].legs, path: paths[entry[0]] };
}
