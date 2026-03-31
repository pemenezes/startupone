export const employeeUser = {
  name: 'Ana Silva',
  company: 'TechCorp S.A.',
  address: 'Rua das Flores, 123 - Centro',
  credits: 350.00,
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
  penalties: { active: 0, warnings: 1 }
};

export const driverUser = {
  name: 'Carlos Roberto',
  vehicle: 'Van ABC-1234',
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
