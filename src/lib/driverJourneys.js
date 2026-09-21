import { supabase } from './supabase';
export { JOURNEY_STATUS, formatJourneyTime, journeyDisplayState } from './driverJourneyState.js';

const SETUP_ERROR_CODES = new Set(['42P01', '42883', 'PGRST202', 'PGRST205']);

function journeyError(error, fallback) {
  if (SETUP_ERROR_CODES.has(error?.code)) {
    return new Error('A jornada persistente ainda não foi ativada no Supabase deste ambiente.');
  }
  if (error?.code === 'P0001' && error.message) return new Error(error.message);
  return new Error(fallback);
}

export async function fetchDriverJourney(driverId, routeId, serviceDate) {
  if (!driverId || !routeId || !serviceDate) return null;
  const { data: active, error: activeError } = await supabase
    .from('driver_journeys')
    .select('id, driver_id, route_id, assignment_id, service_date, direction, status, vehicle_model, vehicle_plate, position_lat, position_lng, position_updated_at, eta_minutes, delay_minutes, started_at, completed_at, cancelled_at, created_at, updated_at')
    .eq('driver_id', driverId)
    .eq('status', 'in_progress')
    .maybeSingle();

  if (activeError) throw journeyError(activeError, 'Não foi possível consultar a execução da jornada.');
  if (active) return active;

  const { data, error } = await supabase
    .from('driver_journeys')
    .select('id, driver_id, route_id, assignment_id, service_date, direction, status, vehicle_model, vehicle_plate, position_lat, position_lng, position_updated_at, eta_minutes, delay_minutes, started_at, completed_at, cancelled_at, created_at, updated_at')
    .eq('driver_id', driverId)
    .eq('route_id', routeId)
    .eq('service_date', serviceDate)
    .maybeSingle();

  if (error) throw journeyError(error, 'Não foi possível consultar a execução da jornada.');
  return data || null;
}

export async function startDriverJourney(routeId, serviceDate) {
  if (!routeId || !serviceDate) throw new Error('Não foi possível identificar a rota e a data da jornada.');
  const { data, error } = await supabase.rpc('start_driver_journey', {
    p_route_id: routeId,
    p_service_date: serviceDate,
  });
  if (error) throw journeyError(error, 'Não foi possível iniciar a jornada. Atualize os dados antes de tentar novamente.');
  return data;
}

export async function completeDriverJourney(journeyId) {
  if (!journeyId) throw new Error('Não foi possível identificar a jornada em andamento.');
  const { data, error } = await supabase.rpc('complete_driver_journey', {
    p_journey_id: journeyId,
  });
  if (error) throw journeyError(error, 'Não foi possível finalizar a jornada. Confira a conexão e tente novamente.');
  return data;
}
