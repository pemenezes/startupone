import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Users } from 'lucide-react';
import { useAuth } from '../../auth-context';
import { fetchDriverAssignments, fetchPassengersForRouteToday } from '../../lib/assignments';

export default function PassengerList() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [routeName, setRouteName] = useState('');
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!profile?.id) return undefined;

    (async () => {
      try {
        const assignments = await fetchDriverAssignments(profile.id);
        const primary = assignments[0];
        if (!primary) {
          if (!cancelled) {
            setPassengers([]);
            setRouteName('');
          }
          return;
        }
        if (!cancelled) setRouteName(primary.route?.name || 'Rota');
        const pax = await fetchPassengersForRouteToday(primary.route_id);
        if (!cancelled) setPassengers(pax);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Falha ao carregar passageiros.');
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

  return (
    <div className="page-transition">
      <h1 style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>Passageiros de hoje</h1>
      <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>
        {routeName || 'Sem rota assumida'} · casas dos inscritos no dia
      </p>

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

      {!routeName ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <Users size={36} style={{ opacity: 0.4, margin: '0 auto 0.5rem' }} />
          <p>Assuma uma rota para ver a lista do dia.</p>
          <button className="btn btn-primary" type="button" onClick={() => navigate('/driver/claim-route')}>
            Assumir rota
          </button>
        </div>
      ) : !passengers.length ? (
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Nenhum passageiro previsto para hoje.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.65rem' }}>
          {passengers.map((p, index) => (
            <div key={p.id} className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span
                style={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {index + 1}
              </span>
              <div>
                <strong>{p.name}</strong>
                <p
                  style={{
                    margin: '0.2rem 0 0',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    gap: '0.3rem',
                    alignItems: 'center',
                  }}
                >
                  <MapPin size={14} /> {p.homeAddress}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
