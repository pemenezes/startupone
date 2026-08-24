import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, Info, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../AppContext';

export default function CancelTrip() {
  const navigate = useNavigate();
  const { currentEmployee, recordNoShow } = useAppContext();
  const route = currentEmployee.activeRoute;
  const [confirmed, setConfirmed] = useState(false);

  const handleCancel = () => {
    recordNoShow(currentEmployee.id);
    setConfirmed(true);
    setTimeout(() => {
      navigate('/employee');
    }, 2000);
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
          height: '100%',
          textAlign: 'center',
          marginTop: '4rem',
        }}
      >
        <CheckCircle2 size={64} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
        <h2>Viagem Cancelada</h2>
        <p>Motorista notificado. A penalidade, se houver, foi aplicada à sua conta.</p>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Cancelar Rota</h1>

      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--danger)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertOctagon size={24} color="var(--danger)" />
          <div>
            <h3 style={{ margin: 0, color: 'var(--danger)', marginBottom: '0.25rem' }}>Atenção à Política</h3>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              Cancelamentos no <strong>mesmo dia</strong> da viagem ou faltas sem aviso prévio geram{' '}
              <strong>Advertências</strong>. O acúmulo de advertências pode resultar na perda temporária do
              benefício.
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3>Detalhes da Rota</h3>
        <p style={{ margin: '0.5rem 0', fontWeight: 'bold' }}>{route.name}</p>
        <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Status: Hoje, {route.estimatedArrival}
        </p>

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
            Ao cancelar hoje, você receberá <strong>1 Advertência</strong>.
          </span>
        </div>
      </div>

      <button className="btn btn-danger" onClick={handleCancel} style={{ marginBottom: '1rem' }}>
        Confirmar Cancelamento
      </button>
      <button className="btn btn-outline" onClick={() => navigate('/employee')}>
        Voltar à Home
      </button>
    </div>
  );
}
