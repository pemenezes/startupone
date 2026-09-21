import { useCallback, useEffect, useState } from 'react';
import { fetchNotifications, markNotificationRead } from './notifications';

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const refresh = useCallback(() => {
    if (!userId) return;
    fetchNotifications(userId).then((rows) => { setNotifications(rows); setError(null); })
      .catch(setError);
  }, [userId]);
  useEffect(() => {
    refresh();
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(refresh, 30000);
    return () => { window.removeEventListener('focus', refresh); window.clearInterval(timer); };
  }, [refresh]);
  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((rows) => rows.map((row) => row.id === id ? { ...row, read: true } : row));
    } catch (nextError) { setError(nextError); }
  };
  return { notifications, error, refresh, markRead };
}
