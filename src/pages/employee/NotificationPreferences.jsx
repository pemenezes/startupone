import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useAuth } from '../../auth-context';
import {
  DEFAULT_NOTIFICATION_PREFS,
  NOTIFICATION_PREF_OPTIONS,
  fetchNotificationPrefs,
  saveNotificationPrefs,
} from '../../lib/notificationPrefs';

export default function NotificationPreferences() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [prefs, setPrefs] = useState(DEFAULT_NOTIFICATION_PREFS);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const next = await fetchNotificationPrefs(profile?.id);
        if (!cancelled) setPrefs(next);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Não foi possível carregar as preferências.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const toggle = async (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSavingKey(key);
    setMessage('');
    setError('');
    try {
      await saveNotificationPrefs(profile?.id, next);
      setMessage('Preferências salvas.');
      window.dispatchEvent(
        new CustomEvent('movecorp:notification-prefs-changed', { detail: next })
      );
    } catch (err) {
      console.error(err);
      setError(err.message || 'Falha ao salvar.');
      setPrefs(prefs);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div
      className="page-transition"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}
    >
      <button
        type="button"
        className="btn btn-outline"
        onClick={() => navigate('/employee/profile')}
        style={{
          width: 'auto',
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <ArrowLeft size={18} /> Voltar ao perfil
      </button>

      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            marginBottom: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Bell size={24} color="var(--primary)" /> Preferências de notificação
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Escolha quais avisos aparecem no sino de notificações.
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
      ) : (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {NOTIFICATION_PREF_OPTIONS.map((option, index) => (
            <div
              key={option.key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.9rem 0',
                borderTop: index === 0 ? 'none' : '1px solid var(--border)',
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{option.label}</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {option.description}
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(prefs[option.key])}
                disabled={savingKey === option.key}
                onChange={() => toggle(option.key)}
                aria-label={option.label}
                style={{
                  width: '42px',
                  height: '22px',
                  cursor: 'pointer',
                  accentColor: 'var(--primary)',
                  flexShrink: 0,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {message && (
        <div
          style={{
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
          }}
        >
          {message}
        </div>
      )}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
