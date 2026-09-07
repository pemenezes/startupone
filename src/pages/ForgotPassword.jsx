import React, { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, BusFront, User, Car } from 'lucide-react';
import { useAuth, ROLE_BY_REGISTER_PATH } from '../auth-context';

const ROLE_UI = {
  employee: {
    title: 'Recuperar senha — Funcionário',
    icon: User,
    accent: 'var(--primary)',
    iconBg: 'var(--primary-light)',
  },
  driver: {
    title: 'Recuperar senha — Motorista',
    icon: Car,
    accent: 'var(--secondary)',
    iconBg: '#f0fdf4',
  },
};

export default function ForgotPassword() {
  const { role: roleParam } = useParams();
  const { requestPasswordReset } = useAuth();
  const expectedRole = ROLE_BY_REGISTER_PATH[roleParam];
  const ui = ROLE_UI[roleParam];

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!expectedRole || !ui) {
    return <Navigate to="/login" replace />;
  }

  const Icon = ui.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const result = await requestPasswordReset(email, roleParam);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(result.message);
  };

  return (
    <div
      className="container page-transition"
      style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'var(--primary-light)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}>
        <Link
          to={`/login/${roleParam}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={18} /> Voltar ao login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <BusFront
            size={48}
            strokeWidth={1.5}
            color="var(--primary)"
            style={{ marginBottom: '0.75rem' }}
          />
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: ui.iconBg,
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
            }}
          >
            <Icon size={28} color={ui.accent} />
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{ui.title}</h1>
          <p
            style={{
              margin: 0,
              color: 'var(--text-primary)',
              fontWeight: 500,
              fontSize: '0.95rem',
            }}
          >
            Informe o e-mail da conta. Enviaremos um link para criar uma nova senha.
          </p>
        </div>

        {success ? (
          <div
            style={{
              backgroundColor: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              fontSize: '0.9rem',
              marginBottom: '1rem',
            }}
          >
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>E-mail</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                }}
              />
            </label>

            {error && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{
                marginTop: '0.5rem',
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? 'wait' : 'pointer',
              }}
            >
              {submitting ? 'Enviando...' : 'Enviar link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
