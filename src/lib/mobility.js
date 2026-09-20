import { supabase } from './supabase';
export { activeStopIndex, journeyPosition, passengerJourneyCopy, stopPosition } from './mobilityState';

export async function fetchRouteStops(routeId) {
  if (!routeId) return [];
  const { data, error } = await supabase.from('route_stops')
    .select('id, route_id, stop_order, name, kind, latitude, longitude, minutes_to_next')
    .eq('route_id', routeId).order('stop_order');
  if (error) throw error;
  return data || [];
}

export async function fetchJourneyStopArrivals(journeyId) {
  if (!journeyId) return [];
  const { data, error } = await supabase.from('driver_journey_stops')
    .select('route_stop_id, arrived_at').eq('journey_id', journeyId);
  if (error) throw error;
  return data || [];
}

export async function confirmJourneyStop(journeyId, stopId) {
  const { data, error } = await supabase.rpc('confirm_driver_stop', {
    p_journey_id: journeyId,
    p_route_stop_id: stopId,
  });
  if (error) throw error;
  return data;
}
