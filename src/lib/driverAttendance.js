import { supabase } from './supabase';

const SETUP_ERROR_CODES = new Set(['42P01', '42883', 'PGRST202', 'PGRST205']);

function attendanceError(error, fallback) {
  if (SETUP_ERROR_CODES.has(error?.code)) {
    return new Error('O controle de embarque ainda não foi ativado no Supabase deste ambiente.');
  }
  if (error?.code === 'P0001' && error.message) return new Error(error.message);
  return new Error(fallback);
}

export async function fetchJourneyPassengers(journeyId) {
  if (!journeyId) return [];
  const { data, error } = await supabase
    .from('driver_journey_passengers')
    .select('id, journey_id, passenger_id, passenger_name, boarding_address, status, recorded_at, updated_at')
    .eq('journey_id', journeyId)
    .order('passenger_name');
  if (error) throw attendanceError(error, 'Não foi possível consultar os passageiros desta jornada.');
  return data || [];
}

export async function recordJourneyPassengerStatus(journeyId, passengerId, status) {
  if (!journeyId || !passengerId) throw new Error('Não foi possível identificar a jornada e o passageiro.');
  const { data, error } = await supabase.rpc('record_driver_passenger_status', {
    p_journey_id: journeyId,
    p_passenger_id: passengerId,
    p_status: status,
  });
  if (error) throw attendanceError(error, 'Não foi possível registrar a situação do passageiro.');
  return data;
}

export async function fetchEmployeeJourneyStatuses(passengerId, serviceDate) {
  if (!passengerId || !serviceDate) return [];
  const { data, error } = await supabase
    .from('driver_journey_passengers')
    .select('id, passenger_id, status, recorded_at, journey:driver_journeys!inner(id, route_id, service_date, status, started_at, completed_at)')
    .eq('passenger_id', passengerId)
    .eq('journey.service_date', serviceDate);
  if (error) throw attendanceError(error, 'Não foi possível consultar a situação da sua viagem.');
  return data || [];
}
