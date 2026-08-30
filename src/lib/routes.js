import { supabase } from './supabase';
import { fetchDriverById } from './drivers';

export async function fetchRoutesForCompany(companyId) {
  const { data, error } = await supabase
    .from('routes')
    .select(
      'id, company_id, name, boarding_stop, driver_id, estimated_arrival, eta_minutes, occupancy'
    )
    .eq('company_id', companyId)
    .eq('active', true)
    .order('name');

  if (error) throw error;

  const routes = data || [];
  const withDrivers = await Promise.all(
    routes.map(async (route) => {
      let driver = null;
      if (route.driver_id) {
        try {
          driver = await fetchDriverById(route.driver_id);
        } catch {
          driver = null;
        }
      }
      return { ...route, driver };
    })
  );

  return withDrivers;
}

export async function fetchRouteById(routeId) {
  const { data, error } = await supabase
    .from('routes')
    .select(
      'id, company_id, name, boarding_stop, driver_id, estimated_arrival, eta_minutes, occupancy'
    )
    .eq('id', routeId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  let driver = null;
  if (data.driver_id) {
    try {
      driver = await fetchDriverById(data.driver_id);
    } catch {
      driver = null;
    }
  }

  return { ...data, driver };
}
