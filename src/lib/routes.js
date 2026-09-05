import { supabase } from './supabase';
import { fetchDriverById } from './drivers';

export const ROUTE_SELECT =
  'id, company_id, region_id, name, boarding_stop, destination_label, direction, typical_start_time, driver_id, estimated_arrival, eta_minutes, occupancy, active';

async function attachDriver(route) {
  if (!route) return null;
  let driver = null;
  if (route.driver_id) {
    try {
      driver = await fetchDriverById(route.driver_id);
    } catch {
      driver = null;
    }
  }

  // Prefer active assignment driver over legacy routes.driver_id
  try {
    const { data: assignment } = await supabase
      .from('driver_route_assignments')
      .select('driver_id')
      .eq('route_id', route.id)
      .eq('active', true)
      .maybeSingle();

    if (assignment?.driver_id) {
      driver = await fetchDriverById(assignment.driver_id);
    }
  } catch {
    /* assignments table may not exist yet */
  }

  return { ...route, driver };
}

export async function fetchRoutesForCompany(companyId, { regionId, direction } = {}) {
  let query = supabase
    .from('routes')
    .select(ROUTE_SELECT)
    .eq('company_id', companyId)
    .eq('active', true)
    .order('name');

  if (regionId) query = query.eq('region_id', regionId);
  if (direction) query = query.eq('direction', direction);

  const { data, error } = await query;
  if (error) throw error;

  return Promise.all((data || []).map(attachDriver));
}

export async function fetchRouteById(routeId) {
  const { data, error } = await supabase
    .from('routes')
    .select(ROUTE_SELECT)
    .eq('id', routeId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return attachDriver(data);
}

export async function fetchClaimableRoutes(companyId) {
  return fetchRoutesForCompany(companyId);
}
