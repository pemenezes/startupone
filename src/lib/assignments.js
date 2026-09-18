import { supabase } from './supabase';
import { isWeekdayScheduled, todayISO } from './schedule';

export async function fetchDriverAssignments(driverId) {
  const { data, error } = await supabase
    .from('driver_route_assignments')
    .select('id, driver_id, route_id, active, starts_on, route:routes(id, name, active, direction, boarding_stop, destination_label, typical_start_time, estimated_arrival, company:companies(name))')
    .eq('driver_id', driverId)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function claimDriverRoute(driverId, routeId) {
  if (!driverId || !routeId) throw new Error('Identifique o motorista e a rota.');
  // The database derives the driver from auth.uid() and performs the entire swap atomically.
  // Never fall back to separate updates if the RPC is not installed.
  const { data, error } = await supabase.rpc('claim_driver_route', { p_route_id: routeId });
  if (error?.code === 'PGRST202' || error?.code === '42883') {
    throw new Error('A troca de rota ainda não está disponível. A operação precisa habilitar este recurso.');
  }
  if (error) throw new Error(error.code === 'P0001' ? error.message : 'Não foi possível confirmar a troca. Atualize a jornada para conferir sua atribuição antes de tentar novamente.');
  return data;
}

export async function fetchPassengersForRouteToday(routeId, date = new Date()) {
  const dateStr = todayISO(date);

  const { data: subs, error } = await supabase
    .from('employee_route_subscriptions')
    .select('id, employee_id, route_id, weekdays, active')
    .eq('route_id', routeId)
    .eq('active', true);

  if (error) throw error;

  const scheduled = (subs || []).filter((s) => isWeekdayScheduled(s.weekdays, date));
  if (!scheduled.length) return [];

  const employeeIds = scheduled.map((s) => s.employee_id);

  const { data: exceptions, error: exError } = await supabase
    .from('attendance_exceptions')
    .select('employee_id, type')
    .eq('route_id', routeId)
    .eq('exception_date', dateStr)
    .in('employee_id', employeeIds);

  if (exError) throw exError;

  const cancelled = new Set(
    (exceptions || []).filter((e) => e.type === 'cancelled').map((e) => e.employee_id)
  );

  const presentIds = employeeIds.filter((id) => !cancelled.has(id));
  if (!presentIds.length) return [];

  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id, full_name, email, home_address')
    .in('id', presentIds);

  if (pError) throw pError;

  if ((profiles || []).length !== new Set(presentIds).size) {
    throw new Error('Não foi possível consultar todos os passageiros previstos. Tente novamente ou consulte a operação.');
  }
  return (profiles || []).map((p) => ({
    id: p.id,
    name: p.full_name || p.email || 'Funcionário',
    homeAddress: p.home_address?.trim() || 'Endereço não informado',
    email: p.email,
  })).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
