import { supabase } from './supabase';

export async function fetchCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function updateEmployeeOnboarding(userId, { companyId, homeAddress, workAddress }) {
  const patch = {};
  if (companyId !== undefined) patch.company_id = companyId;
  if (homeAddress !== undefined) patch.home_address = homeAddress;
  if (workAddress !== undefined) patch.work_address = workAddress;

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select('id, email, full_name, role, company_id, home_address, work_address, credit_balance, credit_last_top_up')
    .single();

  if (error) throw error;
  return data;
}
