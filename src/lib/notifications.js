import { supabase } from './supabase';

export async function fetchNotifications(userId) {
  if (!userId) return [];
  const { data, error } = await supabase.from('app_notifications')
    .select('id, category, type, title, message, action_url, created_at, read_at')
    .eq('recipient_id', userId).order('created_at', { ascending: false }).limit(30);
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id, category: row.category, type: row.type, title: row.title,
    message: row.message, actionUrl: row.action_url,
    createdAt: row.created_at, read: Boolean(row.read_at),
  }));
}

export async function markNotificationRead(id) {
  const { error } = await supabase.from('app_notifications')
    .update({ read_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
