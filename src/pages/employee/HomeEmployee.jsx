import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  ShieldAlert,
  Navigation,
  Wallet,
  XCircle,
  Star,
  Users,
  Sparkles,
} from 'lucide-react';
import { useAppContext } from '../../AppContext';

function getRouteStatusMeta(status) {
  if (status === 'delayed') {
    return {
      label: 'Atrasada',
      backgroundColor: '#fef3c7',
      color: '#b45309',
      borderColor: '#fcd34d',
    };
  }
  if (status === 'en_route') {
    return {
      label: 'A caminho',
      backgroundColor: '#eff6ff',
      color: 'var(--primary)',
      borderColor: '#bfdbfe',
    };
  }
  return {
    label: 'No horário',
    backgroundColor: '#ecfdf5',
    color: 'var(--secondary)',
    borderColor: '#a7f3d0',
  };
}

export default function HomeEmployee() {
  const navigate = useNavigate();
  const { currentEmployee } = useAppContext();
  const route = currentEmployee.activeRoute;
  const statusMeta = getRouteStatusMeta(route.status);
  const suggestedRoutes = currentEmployee.suggestedRoutes || [];
  const isSuspended = currentEmployee.penalties.status === 'suspended';

  return (
    <div className="page-transition">
      <div
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 0 }}>
            Olá, {currentEmployee.name.split(' ')[0]}
          </h1>
        </div>
        <button
          onClick={() => navigate('/employee/wallet')}
          className="btn btn-outline"
          style={{
            width: 'auto',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Wallet size={16} /> {currentEmployee.wallet.balance.toFixed(2)} SC
        </button>
      </div>

      {currentEmployee.penalties.status !== 'stable' && (
        <div
          style={{
            backgroundColor: isSuspended ? '#fef2f2' : '#fffbeb',
            color: isSuspended ? '#b91c1c' : '#92400e',
            border: `1px solid ${isSuspended ? '#fecaca' : '#fde68a'}`,
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            marginBottom: '1.5rem',
          }}
        >
          <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
            {isSuspended
              ? `Sua conta está suspensa devido a ${currentEmployee.penalties.noShows} faltas.`
              : `Aviso: Você possui ${currentEmployee.penalties.noShows} advertência(s) por ausência. Próxima suspensão em ${currentEmployee.penalties.nextPenaltyAt - currentEmployee.penalties.noShows} falta(s).`}
          </span>
        </div>
      )}

      <h3 style={{ marginBottom: '1rem' }}>Sua Viagem Hoje</h3>

      <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
        <div style={{ padding: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem',
              gap: '0.75rem',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.35rem',
                  flexWrap: 'wrap',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Rota {route.id}
                </p>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '999px',
                    backgroundColor: statusMeta.backgroundColor,
                    color: statusMeta.color,
                    border: `1px solid ${statusMeta.borderColor}`,
                  }}
                >
                  {statusMeta.label}
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{route.name}</h2>
              <button
                onClick={() => navigate('/employee/driver-profile')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  padding: 0,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  marginTop: '0.2rem',
                }}
              >
                Motorista: {route.driver} ({route.driverRating} ★)
              </button>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Previsão
              </p>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>
                {route.estimatedArrival}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} color="var(--secondary)" />
              <span style={{ fontSize: '0.9rem' }}>{route.boardingStop}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.9rem' }}>ETA: {route.etaMinutes} min</span>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}
            onClick={() => navigate('/employee/track')}
          >
            <Navigation size={18} /> Acompanhar Van
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                padding: '0.65rem 0.75rem',
              }}
              onClick={() => navigate('/employee/cancel')}
            >
              <XCircle size={16} /> Cancelar
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                padding: '0.65rem 0.75rem',
              }}
              onClick={() => navigate('/employee/review')}
            >
              <Star size={16} /> Avaliar
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0 }}>Escolher Nova Rota</h3>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', width: 'auto' }}
        >
          Alterar
        </button>
      </div>
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginTop: '0.5rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}
      >
        <Sparkles size={14} color="var(--primary)" />
        A inteligência artificial sugeriu as melhores rotas com base no seu endereço.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {suggestedRoutes.map((suggestion) => (
          <div
            key={suggestion.id}
            className="card"
            style={{
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.25rem',
                  flexWrap: 'wrap',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {suggestion.id}
                </p>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    backgroundColor: 'var(--primary-light)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '999px',
                  }}
                >
                  {suggestion.matchScore}% match
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>{suggestion.name}</h3>
              <div
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  marginTop: '0.45rem',
                  flexWrap: 'wrap',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={13} color="var(--secondary)" />
                  {suggestion.boardingStop}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} color="var(--primary)" />
                  {suggestion.estimatedArrival}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Users size={13} />
                  {suggestion.occupancy}%
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: 'auto',
                padding: '0.5rem 0.9rem',
                fontSize: '0.8rem',
                flexShrink: 0,
              }}
              onClick={() => alert(`Rota ${suggestion.id} selecionada (protótipo).`)}
            >
              Escolher
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
