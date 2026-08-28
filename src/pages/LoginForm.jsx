import React, { useState } from 'react';
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, BusFront, Building2, User, Car } from 'lucide-react';
import { useAuth, ROLE_BY_LOGIN_PATH, HOME_BY_ROLE } from '../auth-context';

const ROLE_UI = {
  employee: {
    title: 'Entrar como Funcionário',
    icon: User,
    accent: 'var(--primary)',
    iconBg: 'var(--primary-light)',
  },
  driver: {
    title: 'Entrar como Motorista',
    icon: Car,
    accent: 'var(--secondary)',
    iconBg: '#f0fdf4',
  },
  company: {
    title: 'Entrar como Administrador',
    icon: Building2,
    accent: 'var(--bg-dark-secondary)',
    iconBg: 'var(--bg-dark-secondary)',
    iconColor: 'white',
  },
};

export default function LoginForm() {
  const { role: roleParam } = useParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const expectedRole = ROLE_BY_LOGIN_PATH[roleParam];
  const ui = ROLE_UI[roleParam];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!expectedRole || !ui) {
    return <Navigate to="/login" replace />;
  }

  const Icon = ui.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await signIn(email.trim(), password, expectedRole);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    navigate(HOME_BY_ROLE[result.profile.role], { replace: true });
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
          to="/login"
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
          <ArrowLeft size={18} /> Voltar
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
            <Icon size={28} color={ui.iconColor || ui.accent} />
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
            Digite seu e-mail e senha para continuar.
          </p>
        </div>

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

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Senha</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {(roleParam === 'employee' || roleParam === 'driver') && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            Não tem uma conta?{' '}
            <Link to={`/register/${roleParam}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Cadastre-se
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
