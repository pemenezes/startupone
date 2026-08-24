import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAppContext } from '../../AppContext';

export default function ReviewDriver() {
  const navigate = useNavigate();
  const { currentEmployee } = useAppContext();
  const route = currentEmployee.activeRoute;
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => navigate('/employee'), 1500);
  };

  if (submitted) {
    return (
      <div className="page-transition" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h2 style={{ color: 'var(--secondary)' }}>Obrigado!</h2>
        <p>Sua avaliação ajuda a manter a qualidade do MoveCorp.</p>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Avaliar Viagem</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Como foi a sua viagem com {route.driver} na {route.name}?
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
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
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          minHeight: '100px',
          marginBottom: '1.5rem',
          fontFamily: 'inherit',
        }}
      />

      <button className="btn btn-primary" onClick={handleSubmit} disabled={rating === 0}>
        Enviar Avaliação
      </button>
    </div>
  );
}
