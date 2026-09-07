import { supabase } from './supabase';

/**
 * Load registered drivers (profiles.role = driver + drivers vehicle row).
 */
export async function fetchRegisteredDrivers() {
  const { data: driverRows, error: driversError } = await supabase
    .from('drivers')
    .select(
      'id, photo_url, vehicle_model, vehicle_plate, vehicle_color, vehicle_capacity, vehicle_photo_url, rating_average, rating_count, verified_since'
    )
    .order('rating_average', { ascending: false });

  if (driversError) throw driversError;
  if (!driverRows?.length) return [];

  const ids = driverRows.map((row) => row.id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .in('id', ids)
    .eq('role', 'driver');

  if (profilesError) throw profilesError;

  const profileById = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

  return driverRows
    .map((row) => mapDriverRow(row, profileById[row.id]))
    .filter((driver) => Boolean(driver));
}

export async function fetchDriverById(driverId) {
  const { data: row, error } = await supabase
    .from('drivers')
    .select(
      'id, photo_url, vehicle_model, vehicle_plate, vehicle_color, vehicle_capacity, vehicle_photo_url, rating_average, rating_count, verified_since'
    )
    .eq('id', driverId)
    .maybeSingle();

  if (error) throw error;
  if (!row) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', driverId)
    .maybeSingle();

  if (profileError) throw profileError;
  return mapDriverRow(row, profile);
}

export async function submitDriverReview({ driverId, employeeId, rating, comment, routeName }) {
  const { data, error } = await supabase
    .from('driver_reviews')
    .insert({
      driver_id: driverId,
      employee_id: employeeId,
      rating,
      comment: comment?.trim() || null,
      route_name: routeName || null,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

function mapDriverRow(row, profile) {
  if (!row) return null;
  return {
    id: row.id,
    name: profile?.full_name || 'Motorista',
    email: profile?.email || '',
    photo: row.photo_url || `https://i.pravatar.cc/150?u=${row.id}`,
    vehicle: {
      model: row.vehicle_model || 'Van',
      plate: row.vehicle_plate || 'A definir',
      color: row.vehicle_color || '',
      capacity: row.vehicle_capacity || 15,
      photo: row.vehicle_photo_url || null,
      label: `${row.vehicle_model || 'Van'} · ${row.vehicle_plate || 'A definir'}`,
    },
    rating: {
      average: Number(row.rating_average ?? 5),
      totalReviews: Number(row.rating_count ?? 0),
    },
    verifiedSince: row.verified_since,
  };
}
