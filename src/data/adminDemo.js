export const ADMIN_ROUTE_STATUS = Object.freeze({
  planned: 'Aguardando', in_progress: 'Em andamento', delayed: 'Atrasada',
  completed: 'Concluída', cancelled: 'Cancelada',
});

export function routeLabel(route) {
  return route.code || String(route.id).slice(0, 8).toUpperCase();
}

export function routeBoarded(route) {
  return (route.passengers || []).filter((passenger) => passenger.status === 'boarded').length;
}

export function routeOccupancy(route) {
  return route.capacity > 0 ? Math.round((routeBoarded(route) / route.capacity) * 100) : 0;
}

export function adminSummary(routes, employees, occurrences = []) {
  const operated = routes.filter((route) => ['in_progress', 'delayed', 'completed'].includes(route.status));
  const capacity = operated.reduce((total, route) => total + route.capacity, 0);
  const boarded = operated.reduce((total, route) => total + routeBoarded(route), 0);
  return {
    employees: employees.length,
    occupancy: capacity ? Math.round((boarded / capacity) * 100) : 0,
    routes: {
      total: routes.length,
      inProgress: routes.filter((route) => ['in_progress', 'delayed'].includes(route.status)).length,
      completed: routes.filter((route) => route.status === 'completed').length,
      planned: routes.filter((route) => route.status === 'planned').length,
    },
    occurrences: occurrences.length,
  };
}

export function criticalRoutes(routes, threshold = 60) {
  return routes.filter((route) => ['in_progress', 'delayed', 'completed'].includes(route.status) && routeOccupancy(route) < threshold);
}

export function routeHistory(route) {
  return route.history || [];
}

export function filterAdminRoutes(routes, { region = '', status = '', query = '' } = {}) {
  const term = query.trim().toLocaleLowerCase('pt-BR');
  return routes.filter((route) =>
    (!region || route.region === region)
    && (!status || route.status === status)
    && (!term || [routeLabel(route), route.name, route.driver, route.plate]
      .some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(term)))
  );
}
