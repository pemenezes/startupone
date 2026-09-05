import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Car, Clock, Loader2, MapPin, Star } from 'lucide-react';
import { useAuth } from '../../auth-context';
import { useTrip } from '../../TripContext';
import { fetchRoutesForCompany } from '../../lib/routes';
import { WEEKDAY_OPTIONS, directionLabel } from '../../lib/schedule';

export default function OnboardingRoute() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { selectRoute, subscriptions } = useTrip();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState('outbound');
  const [weekdays, setWeekdays] = useState([1, 2, 3, 4, 5]);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!profile?.company_id) {
      navigate('/employee/onboarding/company', { replace: true });
      return undefined;
    }
    if (!profile?.region_id) {
      navigate('/employee/onboarding/region', { replace: true });
      return undefined;
    }

    fetchRoutesForCompany(profile.company_id, { regionId: profile.region_id })
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
  }, [profile?.company_id, profile?.region_id, navigate]);

  const filtered = useMemo(
    () => routes.filter((r) => (r.direction || 'outbound') === direction),
    [routes, direction]
  );

  const toggleDay = (day) => {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  const handleSelect = async (routeId) => {
    setSavingId(routeId);
    setError('');
    setInfo('');
    try {
      await selectRoute(routeId, weekdays);
      setInfo(
        `${directionLabel(direction)} salva. Você pode escolher a outra direção também, ou ir para o início.`
      );
    } catch (err) {
      setError(err.message || 'Não foi possível salvar a rota.');
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
          Defina a rota fixa e os dias em que você vai presencialmente. Isso vale toda semana até você
          alterar.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          type="button"
          className={`btn ${direction === 'outbound' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setDirection('outbound')}
          style={{ flex: 1 }}
        >
          Ida
        </button>
        <button
          type="button"
          className={`btn ${direction === 'return' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setDirection('return')}
          style={{ flex: 1 }}
        >
          Volta
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <p style={{ margin: '0 0 0.65rem', fontWeight: 600, fontSize: '0.9rem' }}>
          Dias presenciais ({directionLabel(direction).toLowerCase()})
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {WEEKDAY_OPTIONS.map((d) => {
            const on = weekdays.includes(d.value);
            return (
              <button
                key={d.value}
                type="button"
                className={`btn ${on ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => toggleDay(d.value)}
                style={{ width: 'auto', padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}
      {info && (
        <div
          style={{
            background: '#f0fdf4',
            color: '#166534',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}
        >
          {info}
        </div>
      )}

      {subscriptions?.length > 0 && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          Plano atual: {subscriptions.length} rota(s) ativa(s).
        </p>
      )}

      {!filtered.length ? (
        <div className="card">
          <p style={{ margin: 0 }}>
            Nenhuma rota de {directionLabel(direction).toLowerCase()} na sua região. Peça à operação
            ou escolha outra região.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filtered.map((route) => (
            <article key={route.id} className="card" style={{ display: 'grid', gap: '0.65rem' }}>
              <div>
                <small style={{ color: 'var(--text-secondary)' }}>
                  {directionLabel(route.direction)} · {route.id.slice(0, 8)}
                </small>
                <h3 style={{ margin: '0.15rem 0' }}>{route.name}</h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={15} color="var(--secondary)" />{' '}
                {route.destination_label || route.boarding_stop}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={15} color="var(--primary)" /> Saída prevista{' '}
                {route.typical_start_time || route.estimated_arrival}
              </p>
              {route.driver ? (
                <p style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Car size={15} /> {route.driver.name} · {route.driver.vehicle?.label || 'Van'}{' '}
                  <Star size={13} fill="var(--warning)" color="var(--warning)" />{' '}
                  {route.driver.rating?.average?.toFixed?.(1) ?? '—'}
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Bus size={15} style={{ verticalAlign: 'middle' }} /> Sem motorista nesta rota ainda
                  (sem cobertura até a operação atribuir).
                </p>
              )}
              <button
                className="btn btn-primary"
                type="button"
                disabled={Boolean(savingId) || weekdays.length === 0}
                onClick={() => handleSelect(route.id)}
              >
                {savingId === route.id ? 'Salvando...' : `Confirmar ${directionLabel(direction).toLowerCase()}`}
              </button>
            </article>
          ))}
        </div>
      )}

      <button
        className="btn btn-primary"
        type="button"
        style={{ marginTop: '1rem' }}
        onClick={() => navigate('/employee', { replace: true })}
        disabled={!subscriptions?.length}
      >
        Ir para o início
      </button>
      <button
        className="btn btn-outline"
        type="button"
        style={{ marginTop: '0.5rem' }}
        onClick={() => navigate('/employee/onboarding/region')}
      >
        Voltar
      </button>
    </div>
  );
}
