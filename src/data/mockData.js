export const regions = [
  { id: 'REG-01', name: 'Butantã', center: { lat: -23.56, lng: -46.72 }, activeVans: 5, status: 'stable' },
  { id: 'REG-02', name: 'Pinheiros', center: { lat: -23.56, lng: -46.69 }, activeVans: 3, status: 'saturated' },
  { id: 'REG-03', name: 'Centro', center: { lat: -23.55, lng: -46.63 }, activeVans: 8, status: 'stable' },
];

export const employeeUser = {
  name: 'Ana Silva',
  company: 'TechCorp S.A.',
  address: 'Rua das Flores, 123 - Centro',
  wallet: {
    balance: 350.00,
    currency: 'StartupCoin',
    lastTopUp: '2026-04-10',
  },
  preferredRegion: 'REG-03',
  activeRoute: {
    id: 'RT-14',
    name: 'Linha Centro -> Zona Sul',
    vehicle: 'Van Mercedes Sprinter (ABC-1234)',
    driver: 'Carlos Roberto',
    driverRating: 4.8,
    status: 'on_time', // on_time, delayed
    estimatedArrival: '18:15',
    etaMinutes: 12,
    boardingStop: 'Praça Matriz',
    occupancy: 85,
  },
  history: [
    { date: '28/03/2026', route: 'Linha Centro', status: 'Concluída' },
    { date: '27/03/2026', route: 'Linha Centro', status: 'Cancelada (Justificada)' },
  ],
  penalties: { 
    noShows: 1, 
    status: 'warning', // stable, warning, suspended
    nextPenaltyAt: 3, // suspended after 3 no-shows
  },
  suggestedRoutes: [
    {
      id: 'RT-21',
      name: 'Linha Centro Express',
      boardingStop: 'Estação da Luz',
      estimatedArrival: '18:05',
      etaMinutes: 8,
      occupancy: 62,
      matchScore: 96,
    },
    {
      id: 'RT-08',
      name: 'Linha Pinheiros -> Sul',
      boardingStop: 'Rua Augusta, 200',
      estimatedArrival: '18:20',
      etaMinutes: 18,
      occupancy: 74,
      matchScore: 88,
    },
    {
      id: 'RT-33',
      name: 'Linha Butantã Circuito',
      boardingStop: 'Av. Rebouças, 1100',
      estimatedArrival: '18:30',
      etaMinutes: 25,
      occupancy: 51,
      matchScore: 81,
    },
  ],
};

export const driverUser = {
  name: 'Carlos Roberto',
  photo: 'https://i.pravatar.cc/150?u=carlos',
  vehicle: {
    model: 'Mercedes Sprinter',
    plate: 'ABC-1234',
    photo: 'https://images.unsplash.com/photo-1530507629793-55579d776775?auto=format&fit=crop&w=400',
    color: 'White',
    capacity: 15,
  },
  rating: {
    average: 4.8,
    totalReviews: 124,
  },
  securityInfo: {
    cpf: '***.456.***-01',
    license: '123456789',
    backgroundChecked: true,
    verifiedSince: '2023-01-15',
  },
  currentRegion: 'REG-01',
  penalties: {
    level: 0, // 0: None, 1: Minor, 2: Medium, 3: Severe, 4: Very Severe
    history: [],
  },
  todayRoute: {
    id: 'RT-14',
    name: 'Linha Centro -> Zona Sul',
    passengersTotal: 15,
    checkedIn: 10,
    missing: 1,
    stops: [
      { id: 1, address: 'Praça Matriz', passengers: ['Ana Silva', 'João Souza'], time: '18:15', status: 'next' },
      { id: 2, address: 'Av. Brasil, 440', passengers: ['Maria Elena'], time: '18:25', status: 'pending' },
      { id: 3, address: 'Rua 7 de Setembro, 12', passengers: ['Lucas'], time: '18:40', status: 'pending' }
    ]
  }
};
