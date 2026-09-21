import { useCallback, useEffect, useState } from 'react';
import { fetchNotifications, markNotificationRead } from './notifications';
import { isDemoId } from './demoAccess';

const demoItems = {
  employee: [
    { id: 'demo-employee-route', title: 'Sua van está a caminho', message: 'Acompanhe a rota Centro → Campus Comfy no mapa.', type: 'info', category: 'tripUpdates', actionUrl: '/employee', created_at: new Date().toISOString() },
    { id: 'demo-employee-credit', title: 'Saldo disponível', message: 'Confira seus créditos e o histórico de uso.', type: 'success', category: 'credits', actionUrl: '/employee/credits', created_at: new Date().toISOString() },
  ],
  driver: [
    { id: 'demo-driver-route', title: 'Rota de hoje', message: 'Consulte as paradas e os passageiros no mapa.', type: 'info', actionUrl: '/driver', created_at: new Date().toISOString() },
  ],
};

function readDemoNotifications(userId) {
  const role = userId === 'demo-driver' ? 'driver' : 'employee';
  return demoItems[role].map((item) => {
    let read = false;
    try { read = localStorage.getItem(`comfy:notification-read:${item.id}`) === 'true'; } catch { /* ignore */ }
    return { ...item, createdAt: item.created_at, read };
  });
}

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const refresh = useCallback(() => {
    if (!userId) return;
    if (isDemoId(userId)) { setNotifications(readDemoNotifications(userId)); setError(null); return; }
    fetchNotifications(userId).then((rows) => { setNotifications(rows); setError(null); })
      .catch(setError);
  }, [userId]);
  useEffect(() => {
    Promise.resolve().then(refresh);
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(refresh, 30000);
    return () => { window.removeEventListener('focus', refresh); window.clearInterval(timer); };
  }, [refresh]);
  const markRead = async (id) => {
    try {
      if (isDemoId(userId)) {
        try { localStorage.setItem(`comfy:notification-read:${id}`, 'true'); } catch { /* ignore */ }
        setNotifications((rows) => rows.map((row) => row.id === id ? { ...row, read: true } : row));
        return;
      }
      await markNotificationRead(id);
      setNotifications((rows) => rows.map((row) => row.id === id ? { ...row, read: true } : row));
    } catch (nextError) { setError(nextError); }
  };
  return { notifications, error, refresh, markRead };
}
