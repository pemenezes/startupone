import { supabase } from './supabase';
import { fetchRouteById } from './routes';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchActiveTrip(employeeId) {
  const { data, error } = await supabase
    .from('employee_trips')
    .select('id, employee_id, route_id, status, trip_date, created_at')
    .eq('employee_id', employeeId)
    .eq('status', 'active')
    .eq('trip_date', todayISO())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const route = await fetchRouteById(data.route_id);
  return { ...data, route };
}

export async function assignRouteTrip(employeeId, routeId) {
  // Cancel any other active trip today first
  await supabase
    .from('employee_trips')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('employee_id', employeeId)
    .eq('status', 'active')
    .eq('trip_date', todayISO());

  const { data, error } = await supabase
    .from('employee_trips')
    .insert({
      employee_id: employeeId,
      route_id: routeId,
      status: 'active',
      trip_date: todayISO(),
    })
    .select('id, employee_id, route_id, status, trip_date, created_at')
    .single();

  if (error) throw error;

  const route = await fetchRouteById(routeId);
  return { ...data, route };
}

export async function cancelActiveTrip(tripId) {
  const { data, error } = await supabase
    .from('employee_trips')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', tripId)
    .eq('status', 'active')
    .select('id, status')
    .maybeSingle();

  if (error) throw error;
  return data;
}
