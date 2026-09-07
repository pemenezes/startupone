import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Clock, Loader2, MapPin, Users } from 'lucide-react';
import { useAuth } from '../../auth-context';
import { fetchDriverAssignments, fetchPassengersForRouteToday } from '../../lib/assignments';
import { directionLabel } from '../../lib/schedule';

export default function HomeDriver() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const primary = assignments[0] || null;
  const route = primary?.route;

  useEffect(() => {
    let cancelled = false;
    if (!profile?.id) return undefined;

    (async () => {
      setLoading(true);
      try {
        const list = await fetchDriverAssignments(profile.id);
        if (cancelled) return;
        setAssignments(list);
        if (list[0]?.route_id) {
          const pax = await fetchPassengersForRouteToday(list[0].route_id);
          if (!cancelled) setPassengers(pax);
        } else {
          setPassengers([]);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Falha ao carregar jornada.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="page-transition" style={{ textAlign: 'center', padding: '3rem' }}>
        <Loader2 className="spin" size={28} color="var(--secondary)" />
      </div>
    );
  }

  if (!primary) {
    return (
      <div className="page-transition">
        <h1 style={{ fontSize: '1.4rem' }}>Sua jornada</h1>
        <div className="card" style={{ textAlign: 'center', display: 'grid', gap: '0.75rem' }}>
          <Bus size={36} color="var(--secondary)" style={{ margin: '0 auto' }} />
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Nenhuma rota assumida</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Escolha uma empresa e uma rota. Você ficará responsável por ela de segunda a sexta.
          </p>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => navigate('/driver/claim-route')}
            style={{ background: 'var(--secondary)', borderColor: 'var(--secondary)' }}
          >
            Assumir rota
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition" style={{ display: 'grid', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>Sua jornada</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Rota fixa · responsabilidade seg–sex
        </p>
      </div>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
          }}
        >
          {error}
        </div>
      )}

      <article className="card" style={{ display: 'grid', gap: '0.55rem' }}>
        <small style={{ color: 'var(--text-secondary)' }}>
          {directionLabel(route?.direction)} · desde {primary.starts_on}
        </small>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{route?.name}</h2>
        <p style={{ margin: 0, display: 'flex', gap: '0.35rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <MapPin size={16} /> {route?.destination_label || route?.boarding_stop}
        </p>
        <p style={{ margin: 0, display: 'flex', gap: '0.35rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <Clock size={16} /> Saída {route?.typical_start_time || route?.estimated_arrival}
        </p>
        <button className="btn btn-outline" type="button" onClick={() => navigate('/driver/claim-route')}>
          Trocar rota assumida
        </button>
      </article>

      <section className="card">
        <h3 style={{ marginTop: 0, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Users size={18} /> Passageiros de hoje ({passengers.length})
        </h3>
        {!passengers.length ? (
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Ninguém previsto para hoje (fora dos dias presenciais ou todos cancelaram).
          </p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.65rem' }}>
            {passengers.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.homeAddress}</div>
              </li>
            ))}
          </ul>
        )}
        <button
          className="btn btn-primary"
          type="button"
          style={{ marginTop: '1rem', background: 'var(--secondary)', borderColor: 'var(--secondary)' }}
          onClick={() => navigate('/driver/passengers')}
        >
          Ver lista completa
        </button>
      </section>
    </div>
  );
}
