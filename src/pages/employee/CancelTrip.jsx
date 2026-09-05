import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AlertOctagon, Info, CheckCircle2 } from 'lucide-react';
import { useTrip } from '../../TripContext';
import { useAppContext } from '../../app-context';
import { useAuth } from '../../auth-context';

export default function CancelTrip() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { currentEmployee, recordNoShow } = useAppContext();
  const { activeTrip, hasActiveTrip, cancelTrip } = useTrip();
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!hasActiveTrip && !confirmed) {
    return <Navigate to="/employee" replace />;
  }

  const route = activeTrip?.route;

  const handleCancel = async () => {
    setSaving(true);
    setError('');
    try {
      await cancelTrip(activeTrip.route_id);
      const employeeId = profile?.id || currentEmployee.id;
      if (employeeId) recordNoShow(employeeId);
      setConfirmed(true);
      setTimeout(() => navigate('/employee', { replace: true }), 1800);
    } catch (err) {
      setError(err.message || 'Não foi possível cancelar a viagem.');
    } finally {
      setSaving(false);
    }
  };

  if (confirmed) {
    return (
      <div
        className="page-transition"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          marginTop: '4rem',
        }}
      >
        <CheckCircle2 size={64} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
        <h2>Viagem cancelada</h2>
        <p>Cancelamento registrado só para hoje. Seu plano semanal continua valendo.</p>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Cancelar só hoje</h1>

      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--danger)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertOctagon size={24} color="var(--danger)" />
          <div>
            <h3 style={{ margin: 0, color: 'var(--danger)', marginBottom: '0.25rem' }}>Atenção à política</h3>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              Cancelamentos no <strong>mesmo dia</strong> geram <strong>advertências</strong>. O acúmulo pode suspender o
              benefício.
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3>Detalhes da rota</h3>
        <p style={{ margin: '0.5rem 0', fontWeight: 'bold' }}>{route.name}</p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Embarque: {route.boarding_stop} · Hoje, {route.estimated_arrival}
        </p>
        {route.driver && (
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Motorista: {route.driver.name} · {route.driver.vehicle.label}
          </p>
        )}

        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <Info size={18} color="var(--warning)" />
          <span style={{ fontSize: '0.85rem' }}>
            Ao cancelar hoje, você receberá <strong>1 advertência</strong>.
          </span>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}
        >
          {error}
        </div>
      )}

      <button className="btn btn-danger" type="button" onClick={handleCancel} disabled={saving} style={{ marginBottom: '1rem' }}>
        {saving ? 'Cancelando...' : 'Confirmar cancelamento'}
      </button>
      <button className="btn btn-outline" type="button" onClick={() => navigate('/employee')}>
        Voltar à home
      </button>
    </div>
  );
}
