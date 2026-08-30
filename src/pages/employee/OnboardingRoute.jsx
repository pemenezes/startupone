import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Car, Clock, Loader2, MapPin, Star } from 'lucide-react';
import { useAuth } from '../../auth-context';
import { useTrip } from '../../TripContext';
import { fetchRoutesForCompany } from '../../lib/routes';

export default function OnboardingRoute() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { selectRoute } = useTrip();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!profile?.company_id) {
      navigate('/employee/onboarding/company', { replace: true });
      return undefined;
    }

    fetchRoutesForCompany(profile.company_id)
      .then((list) => {
        if (!cancelled) setRoutes(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Falha ao carregar rotas.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile?.company_id, navigate]);

  const handleSelect = async (routeId) => {
    setSavingId(routeId);
    setError('');
    try {
      await selectRoute(routeId);
      navigate('/employee', { replace: true });
    } catch (err) {
      setError(err.message || 'Não foi possível escolher a rota.');
    } finally {
      setSavingId('');
    }
  };

  if (loading) {
    return (
      <div className="page-transition" style={{ textAlign: 'center', padding: '3rem' }}>
        <Loader2 className="spin" size={28} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', margin: '0 0 0.35rem' }}>Escolher rota</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Selecione a linha do fretado. Depois disso você poderá acompanhar e cancelar a viagem.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {!routes.length ? (
        <div className="card">
          <p style={{ margin: 0 }}>Nenhuma rota ativa para sua empresa ainda. Peça ao administrador para cadastrar linhas.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {routes.map((route) => (
            <article key={route.id} className="card" style={{ display: 'grid', gap: '0.65rem' }}>
              <div>
                <small style={{ color: 'var(--text-secondary)' }}>{route.id.slice(0, 8)}</small>
                <h3 style={{ margin: '0.15rem 0' }}>{route.name}</h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={15} color="var(--secondary)" /> {route.boarding_stop}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={15} color="var(--primary)" /> Chegada {route.estimated_arrival} · ETA {route.eta_minutes} min
              </p>
              {route.driver ? (
                <p style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Car size={15} /> {route.driver.name} · {route.driver.vehicle.label}{' '}
                  <Star size={13} fill="var(--warning)" color="var(--warning)" /> {route.driver.rating.average.toFixed(1)}
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Bus size={15} style={{ verticalAlign: 'middle' }} /> Motorista/van a definir pela operação
                </p>
              )}
              <button
                className="btn btn-primary"
                type="button"
                disabled={Boolean(savingId)}
                onClick={() => handleSelect(route.id)}
              >
                {savingId === route.id ? 'Confirmando...' : 'Escolher esta rota'}
              </button>
            </article>
          ))}
        </div>
      )}

      <button
        className="btn btn-outline"
        type="button"
        style={{ marginTop: '1rem' }}
        onClick={() => navigate('/employee/onboarding/addresses')}
      >
        Voltar
      </button>
    </div>
  );
}
