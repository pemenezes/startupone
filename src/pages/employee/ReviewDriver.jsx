import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Car, User, Loader2, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../app-context';
import { useAuth } from '../../auth-context';
import { useTrip } from '../../TripContext';
import { fetchRegisteredDrivers, submitDriverReview } from '../../lib/drivers';

export default function ReviewDriver() {
  const navigate = useNavigate();
  const { currentEmployee } = useAppContext();
  const { profile, user } = useAuth();
  const { activeTrip } = useTrip();
  const route = activeTrip?.route || currentEmployee.activeRoute;

  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const list = await fetchRegisteredDrivers();
        if (cancelled) return;
        setDrivers(list);

        const preferred =
          list.find((d) => d.id === route?.driver_id) ||
          list.find((d) => d.id === route?.driver?.id) ||
          list.find((d) => d.name.toLowerCase() === String(route?.driver?.name || route?.driver || '').toLowerCase()) ||
          list[0];

        setSelectedDriverId(preferred?.id || '');
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setLoadError(
            'Não foi possível carregar os motoristas. Rode o SQL docs/drivers_and_reviews.sql no Supabase e confirme que há motoristas cadastrados.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [route?.driver, route?.driver_id, route?.driver?.id, route?.driver?.name]);

  const selectedDriver = useMemo(
    () => drivers.find((d) => d.id === selectedDriverId) || null,
    [drivers, selectedDriverId]
  );

  const employeeId = profile?.id || user?.id || currentEmployee?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDriver || rating === 0 || !employeeId) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await submitDriverReview({
        driverId: selectedDriver.id,
        employeeId,
        rating,
        comment,
        routeName: route?.name,
      });
      setSubmitted(true);
      setTimeout(() => navigate('/employee'), 1600);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Falha ao enviar avaliação.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-transition" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h2 style={{ color: 'var(--secondary)' }}>Obrigado!</h2>
        <p>Sua avaliação de {selectedDriver?.name || 'motorista'} foi registrada na plataforma.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-transition" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--primary)' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Carregando motoristas...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page-transition">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Avaliar viagem</h1>
        <div
          className="card"
          style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
            background: '#fef2f2',
            borderColor: '#fecaca',
            color: '#991b1b',
          }}
        >
          <AlertCircle size={22} />
          <div>
            <strong>Erro ao carregar</strong>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem' }}>{loadError}</p>
          </div>
        </div>
        <button className="btn btn-outline" style={{ marginTop: '1rem' }} type="button" onClick={() => navigate('/employee')}>
          Voltar
        </button>
      </div>
    );
  }

  if (!drivers.length) {
    return (
      <div className="page-transition">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Avaliar viagem</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Ainda não há motoristas cadastrados na plataforma. Peça para um motorista se registrar (Sou motorista) e
          atualize os dados do veículo no Supabase se necessário.
        </p>
        <button className="btn btn-outline" style={{ marginTop: '1rem' }} type="button" onClick={() => navigate('/employee')}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Avaliar viagem</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
        Avalie o motorista e o veículo cadastrados na MoveCorp
        {route?.name ? (
          <>
            {' '}
            · rota <strong>{route.name}</strong>
          </>
        ) : null}
        .
      </p>

      {drivers.length > 1 && (
        <label style={{ display: 'grid', gap: '0.35rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Motorista</span>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              fontSize: '1rem',
              background: 'white',
            }}
          >
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} · {driver.vehicle.plate}
              </option>
            ))}
          </select>
        </label>
      )}

      {selectedDriver && (
        <div className="card" style={{ marginBottom: '1.5rem', display: 'grid', gap: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={16} color="var(--primary)" />
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{selectedDriver.name}</h2>
            </div>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {selectedDriver.rating.average.toFixed(1)} ★ · {selectedDriver.rating.totalReviews} avaliações
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.65rem',
              alignItems: 'center',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
            }}
          >
            <Car size={20} color="var(--secondary)" />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>{selectedDriver.vehicle.model}</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Placa {selectedDriver.vehicle.plate}
                {selectedDriver.vehicle.color ? ` · ${selectedDriver.vehicle.color}` : ''}
                {selectedDriver.vehicle.capacity ? ` · ${selectedDriver.vehicle.capacity} lugares` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
              aria-label={`${star} estrelas`}
            >
              <Star
                size={40}
                color={rating >= star ? 'var(--warning)' : 'var(--border)'}
                fill={rating >= star ? 'var(--warning)' : 'transparent'}
              />
            </button>
          ))}
        </div>

        <textarea
          placeholder="Adicione um comentário (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            minHeight: '100px',
            marginBottom: '1rem',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />

        {submitError && (
          <div
            style={{
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {submitError}
          </div>
        )}

        <button
          className="btn btn-primary"
          type="submit"
          disabled={rating === 0 || !selectedDriver || submitting}
          style={{ opacity: rating === 0 || submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Enviando...' : 'Enviar avaliação'}
        </button>
      </form>
    </div>
  );
}
