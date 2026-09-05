import { supabase } from './supabase';

export const DEFAULT_NOTIFICATION_PREFS = {
  penalties: true,
  tripUpdates: true,
  credits: true,
  companyMessages: true,
  routeChanges: true,
};

export const NOTIFICATION_PREF_OPTIONS = [
  {
    key: 'penalties',
    label: 'Advertências e penalidades',
    description: 'Avisos quando houver advertência ou risco de suspensão.',
  },
  {
    key: 'tripUpdates',
    label: 'Atualizações da viagem',
    description: 'Van a caminho, atrasos e mudanças de horário.',
  },
  {
    key: 'credits',
    label: 'Créditos e saldo',
    description: 'Recargas, débitos e alertas de saldo baixo.',
  },
  {
    key: 'companyMessages',
    label: 'Mensagens da empresa',
    description: 'Comunicados do RH e da operação.',
  },
  {
    key: 'routeChanges',
    label: 'Alterações de rota',
    description: 'Nova linha atribuída ou mudança de ponto de embarque.',
  },
];

function storageKey(userId) {
  return `movecorp:notification-prefs:${userId}`;
}

export function mergePrefs(raw) {
  return { ...DEFAULT_NOTIFICATION_PREFS, ...(raw || {}) };
}

export function readLocalNotificationPrefs(userId) {
  if (!userId) return { ...DEFAULT_NOTIFICATION_PREFS };
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { ...DEFAULT_NOTIFICATION_PREFS };
    return mergePrefs(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFS };
  }
}

export function writeLocalNotificationPrefs(userId, prefs) {
  if (!userId) return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(mergePrefs(prefs)));
  } catch {
    /* ignore */
  }
}

export async function fetchNotificationPrefs(userId) {
  if (!userId) return { ...DEFAULT_NOTIFICATION_PREFS };

  const local = readLocalNotificationPrefs(userId);

  const { data, error } = await supabase
    .from('profiles')
    .select('notification_prefs')
    .eq('id', userId)
    .maybeSingle();

  // Column may not exist until employee_notification_prefs.sql is run
  if (error || !data) return local;

  const merged = mergePrefs(data.notification_prefs);
  writeLocalNotificationPrefs(userId, merged);
  return merged;
}

export async function saveNotificationPrefs(userId, prefs) {
  const next = mergePrefs(prefs);
  writeLocalNotificationPrefs(userId, next);

  if (!userId) return next;

  const { error } = await supabase
    .from('profiles')
    .update({ notification_prefs: next })
    .eq('id', userId);

  if (error) {
    // Still keep local copy so UX works before SQL migration
    console.warn('notification_prefs not saved remotely:', error.message);
  }

  return next;
}

export function filterNotificationsByPrefs(notifications, prefs) {
  const effective = mergePrefs(prefs);
  return (notifications || []).filter((item) => {
    const category = item.category;
    if (!category) return true;
    return effective[category] !== false;
  });
}
