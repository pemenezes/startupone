import { supabase } from './supabase';
import { fetchRouteById } from './routes';
import { isWeekdayScheduled, todayISO } from './schedule';

export async function fetchDriverAssignments(driverId) {
  const { data, error } = await supabase
    .from('driver_route_assignments')
    .select('id, driver_id, route_id, active, starts_on')
    .eq('driver_id', driverId)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return Promise.all(
    (data || []).map(async (row) => ({
      ...row,
      route: await fetchRouteById(row.route_id),
    }))
  );
}

export async function claimDriverRoute(driverId, routeId) {
  await supabase
    .from('driver_route_assignments')
    .update({ active: false })
    .eq('driver_id', driverId)
    .eq('active', true);

  const { data: existing } = await supabase
    .from('driver_route_assignments')
    .select('id')
    .eq('driver_id', driverId)
    .eq('route_id', routeId)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await supabase
      .from('driver_route_assignments')
      .update({ active: true, starts_on: todayISO() })
      .eq('id', existing.id)
      .select('id, driver_id, route_id, active, starts_on')
      .single();
    if (error) throw error;
    return { ...data, route: await fetchRouteById(routeId) };
  }

  const { data, error } = await supabase
    .from('driver_route_assignments')
    .insert({
      driver_id: driverId,
      route_id: routeId,
      active: true,
      starts_on: todayISO(),
    })
    .select('id, driver_id, route_id, active, starts_on')
    .single();

  if (error) throw error;
  return { ...data, route: await fetchRouteById(routeId) };
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

  return (profiles || []).map((p) => ({
    id: p.id,
    name: p.full_name || p.email || 'Funcionário',
    homeAddress: p.home_address || 'Endereço não informado',
    email: p.email,
  }));
}
