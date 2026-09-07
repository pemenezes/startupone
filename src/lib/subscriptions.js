import { supabase } from './supabase';
import { fetchRouteById } from './routes';
import { isWeekdayScheduled, parseWeekdays, todayISO } from './schedule';

export async function fetchEmployeeSubscriptions(employeeId) {
  const { data, error } = await supabase
    .from('employee_route_subscriptions')
    .select('id, employee_id, route_id, weekdays, active, created_at')
    .eq('employee_id', employeeId)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const rows = data || [];
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      weekdays: parseWeekdays(row.weekdays),
      route: await fetchRouteById(row.route_id),
    }))
  );
}

export async function upsertSubscription(employeeId, routeId, weekdays) {
  const cleaned = parseWeekdays(weekdays);
  if (!cleaned.length) {
    throw new Error('Selecione pelo menos um dia da semana.');
  }

  const { data: existing } = await supabase
    .from('employee_route_subscriptions')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('route_id', routeId)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await supabase
      .from('employee_route_subscriptions')
      .update({
        weekdays: cleaned,
        active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('id, employee_id, route_id, weekdays, active')
      .single();
    if (error) throw error;
    return {
      ...data,
      weekdays: parseWeekdays(data.weekdays),
      route: await fetchRouteById(routeId),
    };
  }

  const { data, error } = await supabase
    .from('employee_route_subscriptions')
    .insert({
      employee_id: employeeId,
      route_id: routeId,
      weekdays: cleaned,
      active: true,
    })
    .select('id, employee_id, route_id, weekdays, active')
    .single();

  if (error) throw error;
  return {
    ...data,
    weekdays: parseWeekdays(data.weekdays),
    route: await fetchRouteById(routeId),
  };
}

export async function deactivateSubscription(subscriptionId) {
  const { error } = await supabase
    .from('employee_route_subscriptions')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', subscriptionId);
  if (error) throw error;
}

export async function fetchException(employeeId, routeId, dateStr) {
  const { data, error } = await supabase
    .from('attendance_exceptions')
    .select('id, type, reason')
    .eq('employee_id', employeeId)
    .eq('route_id', routeId)
    .eq('exception_date', dateStr)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function cancelTodayForSubscription(employeeId, routeId, reason = 'Cancelamento do dia') {
  const dateStr = todayISO();
  const { data, error } = await supabase
    .from('attendance_exceptions')
    .upsert(
      {
        employee_id: employeeId,
        route_id: routeId,
        exception_date: dateStr,
        type: 'cancelled',
        reason,
      },
      { onConflict: 'employee_id,route_id,exception_date' }
    )
    .select('id, type, exception_date')
    .single();

  if (error) throw error;
  return data;
}

/** Subscriptions expected to ride today (weekday match and not cancelled). */
export async function fetchTodayRides(employeeId, date = new Date()) {
  const subs = await fetchEmployeeSubscriptions(employeeId);
  const dateStr = todayISO(date);
  const rides = [];

  for (const sub of subs) {
    if (!isWeekdayScheduled(sub.weekdays, date)) continue;
    const ex = await fetchException(employeeId, sub.route_id, dateStr);
    if (ex?.type === 'cancelled') {
      rides.push({ ...sub, expectedToday: false, cancelledToday: true });
    } else {
      rides.push({ ...sub, expectedToday: true, cancelledToday: false });
    }
  }

  return rides;
}
