import { supabase } from './supabase';

export async function fetchCompanyOperations() {
  const { data, error } = await supabase.rpc('company_operations');
  if (error) throw error;
  if (!data?.company) throw new Error('A conta administrativa precisa estar associada a uma empresa.');
  const routes = (data.routes || []).map((route) => ({
    ...route,
    capacity: Number(route.capacity || 0),
    etaMinutes: route.etaMinutes == null ? null : Number(route.etaMinutes),
    progress: Number(route.progress || 0),
    noShows30Days: Number(route.noShows30Days || 0),
    path: route.path || [],
    passengers: route.passengers || [],
    history: route.history || [],
  }));
  const employees = (data.employees || []).map((employee) => ({
    ...employee,
    balance: Number(employee.balance || 0),
    penalties: Number(employee.penalties || 0),
  }));
  const creditTransactions = (data.creditTransactions || []).map((entry) => ({
    ...entry, amount: Number(entry.amount || 0),
  }));
  const occurrences = routes.flatMap((route) => [
    ...(route.status === 'delayed' ? [{ id: `${route.id}:delay`, routeId: route.id, type: 'Atraso', detail: 'Chegada prevista atualizada.' }] : []),
    ...(route.noShows30Days ? [{ id: `${route.id}:absence`, routeId: route.id, type: 'Ausência', detail: `${route.noShows30Days} ausência(s) nos últimos 30 dias.` }] : []),
  ]);
  return { company: data.company, routes, employees, creditTransactions, occurrences };
}
