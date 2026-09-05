import { supabase } from './supabase';

export async function fetchRegions() {
  const { data, error } = await supabase
    .from('regions')
    .select('id, name, city')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function fetchRegionById(regionId) {
  if (!regionId) return null;
  const { data, error } = await supabase
    .from('regions')
    .select('id, name, city')
    .eq('id', regionId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
