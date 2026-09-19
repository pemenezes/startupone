export const adminCompany = Object.freeze({
  name: 'TechCorp S.A.',
  plan: 'Business',
  monthlyContract: 48000,
});

export const adminEmployees = Object.freeze([
  { id: 'E101', name: 'Ana Silva', department: 'Tecnologia', routeId: 'RT-14', balance: 335, penalties: 0 },
  { id: 'E102', name: 'Bruno Costa', department: 'Tecnologia', routeId: 'RT-14', balance: 350, penalties: 0 },
  { id: 'E103', name: 'Carla Mendes', department: 'Financeiro', routeId: 'RT-14', balance: 310, penalties: 1 },
  { id: 'E104', name: 'Diego Oliveira', department: 'Operações', routeId: 'RT-14', balance: 350, penalties: 0 },
  { id: 'E105', name: 'Elisa Santos', department: 'Vendas', routeId: 'RT-42', balance: 260, penalties: 0 },
  { id: 'E106', name: 'Felipe Lima', department: 'Vendas', routeId: 'RT-42', balance: 280, penalties: 0 },
  { id: 'E107', name: 'Gabriela Rocha', department: 'Financeiro', routeId: 'RT-42', balance: 350, penalties: 1 },
  { id: 'E108', name: 'Henrique Alves', department: 'Tecnologia', routeId: 'RT-08', balance: 320, penalties: 0 },
  { id: 'E109', name: 'Isabela Martins', department: 'Operações', routeId: 'RT-08', balance: 275, penalties: 0 },
  { id: 'E110', name: 'João Pereira', department: 'Vendas', routeId: 'RT-08', balance: 300, penalties: 0 },
  { id: 'E111', name: 'Larissa Ribeiro', department: 'Financeiro', routeId: 'RT-21', balance: 350, penalties: 0 },
  { id: 'E112', name: 'Marcos Nunes', department: 'Operações', routeId: 'RT-21', balance: 350, penalties: 0 },
]);

export const adminRoutes = Object.freeze([
  {
    id: 'RT-14', name: 'Centro → Zona Sul', region: 'Centro', status: 'in_progress',
    driver: 'Carlos Roberto', vehicle: 'Van ABC-1234', plate: 'ABC-1234',
    capacity: 5, departure: '07:30', arrival: '08:20', etaMinutes: 12,
    progress: 65, nextStop: 'Avenida Paulista, 1200',
    path: [[-23.5431, -46.6427], [-23.5558, -46.6515], [-23.5649, -46.6544], [-23.5757, -46.6405]],
    position: [-23.5649, -46.6544],
    passengers: [{ id: 'E101', status: 'boarded' }, { id: 'E102', status: 'boarded' }, { id: 'E103', status: 'boarded' }, { id: 'E104', status: 'boarded' }],
    noShows30Days: 2, historyBase: 76,
  },
  {
    id: 'RT-42', name: 'Zona Norte → Fábrica', region: 'Zona Norte', status: 'delayed',
    driver: 'Marcos Teixeira', vehicle: 'Van DEF-9990', plate: 'DEF-9990',
    capacity: 8, departure: '07:20', arrival: '08:55', etaMinutes: 24,
    progress: 28, nextStop: 'Rua Voluntários da Pátria, 820',
    path: [[-23.4920, -46.6268], [-23.5072, -46.6312], [-23.5214, -46.6375], [-23.5431, -46.6427]],
    position: [-23.5072, -46.6312],
    passengers: [{ id: 'E105', status: 'boarded' }, { id: 'E106', status: 'boarded' }, { id: 'E107', status: 'absent' }],
    noShows30Days: 7, historyBase: 43,
  },
  {
    id: 'RT-08', name: 'Pinheiros → Centro', region: 'Pinheiros', status: 'completed',
    driver: 'Fernanda Lopes', vehicle: 'Van GHI-4821', plate: 'GHI-4821',
    capacity: 6, departure: '06:50', arrival: '07:42', etaMinutes: 0,
    progress: 100, nextStop: 'Destino concluído',
    path: [[-23.5655, -46.6910], [-23.5623, -46.6723], [-23.5558, -46.6515], [-23.5431, -46.6427]],
    position: [-23.5431, -46.6427],
    passengers: [{ id: 'E108', status: 'boarded' }, { id: 'E109', status: 'boarded' }, { id: 'E110', status: 'boarded' }],
    noShows30Days: 3, historyBase: 58,
  },
  {
    id: 'RT-21', name: 'Butantã → Campus', region: 'Butantã', status: 'planned',
    driver: 'Rafael Almeida', vehicle: 'Van JKL-7702', plate: 'JKL-7702',
    capacity: 6, departure: '18:15', arrival: '19:05', etaMinutes: null,
    progress: 0, nextStop: 'Aguardando início',
    path: [[-23.5672, -46.7174], [-23.5655, -46.6910], [-23.5623, -46.6723], [-23.5558, -46.6515]],
    position: [-23.5672, -46.7174],
    passengers: [{ id: 'E111', status: 'expected' }, { id: 'E112', status: 'expected' }],
    noShows30Days: 1, historyBase: 67,
  },
]);

export const adminOccurrences = Object.freeze([
  { id: 'OC-01', routeId: 'RT-42', type: 'Atraso', detail: 'Chegada prevista além do horário planejado.' },
  { id: 'OC-02', routeId: 'RT-42', type: 'Ausência', detail: 'Uma ausência confirmada pelo motorista.' },
]);

export const adminCreditTransactions = Object.freeze([
  { id: 'TX-01', employeeId: 'E101', title: 'Recarga corporativa', amount: 350, date: '2026-09-01' },
  { id: 'TX-02', employeeId: 'E102', title: 'Recarga corporativa', amount: 350, date: '2026-09-01' },
  { id: 'TX-03', employeeId: 'E101', title: 'Viagem de fretado', amount: -15, date: '2026-09-03' },
  { id: 'TX-04', employeeId: 'E105', title: 'Ajuste de crédito', amount: 50, date: '2026-09-05' },
]);

export const ADMIN_ROUTE_STATUS = Object.freeze({
  planned: 'Aguardando', in_progress: 'Em andamento', delayed: 'Atrasada', completed: 'Concluída',
});

export function routeBoarded(route) {
  return route.passengers.filter((passenger) => passenger.status === 'boarded').length;
}

export function routeOccupancy(route) {
  return route.capacity > 0 ? Math.round((routeBoarded(route) / route.capacity) * 100) : 0;
}

export function adminSummary(routes = adminRoutes, employees = adminEmployees) {
  const operated = routes.filter((route) => route.status !== 'planned');
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
    occurrences: adminOccurrences.length,
  };
}

export function criticalRoutes(routes = adminRoutes, threshold = 60) {
  return routes.filter((route) => route.status !== 'planned' && routeOccupancy(route) < threshold);
}

export function routeHistory(route) {
  return Array.from({ length: 30 }, (_, index) => ({
    day: index + 1,
    occupancy: Math.max(12, Math.min(100, route.historyBase + (((index * 7 + route.id.length * 3) % 19) - 9))),
  }));
}

export function filterAdminRoutes(routes, { region = '', status = '', query = '' } = {}) {
  const term = query.trim().toLocaleLowerCase('pt-BR');
  return routes.filter((route) =>
    (!region || route.region === region)
    && (!status || route.status === status)
    && (!term || [route.id, route.name, route.driver, route.plate].some((value) => value.toLocaleLowerCase('pt-BR').includes(term)))
  );
}
