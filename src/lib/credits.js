import { supabase } from './supabase';

export async function fetchCreditBalance(employeeId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('credit_balance, credit_last_top_up')
    .eq('id', employeeId)
    .maybeSingle();

  if (error) throw error;
  return {
    balance: Number(data?.credit_balance ?? 0),
    lastTopUp: data?.credit_last_top_up || null,
  };
}

export async function fetchCreditTransactions(employeeId, limit = 30) {
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('id, amount, title, created_at')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Atomically-ish adjust balance: read current, write new + ledger row.
 * For production concurrency, prefer a Postgres RPC later.
 */
export async function adjustEmployeeCredits(employeeId, amount, title) {
  const current = await fetchCreditBalance(employeeId);
  const nextBalance = Number((current.balance + amount).toFixed(2));

  if (nextBalance < 0) {
    throw new Error('Saldo insuficiente.');
  }

  const patch = {
    credit_balance: nextBalance,
  };
  if (amount > 0) {
    patch.credit_last_top_up = new Date().toISOString().slice(0, 10);
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', employeeId);

  if (profileError) throw profileError;

  const { data: tx, error: txError } = await supabase
    .from('credit_transactions')
    .insert({
      employee_id: employeeId,
      amount,
      title: title || (amount >= 0 ? 'Recarga de saldo' : 'Débito'),
    })
    .select('id, amount, title, created_at')
    .single();

  if (txError) throw txError;

  return {
    balance: nextBalance,
    lastTopUp: patch.credit_last_top_up || current.lastTopUp,
    transaction: tx,
  };
}
