import React, { useState } from 'react';
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, BusFront, User, Car } from 'lucide-react';
import { useAuth, ROLE_BY_REGISTER_PATH, HOME_BY_ROLE } from '../AuthContext';

const ROLE_UI = {
  employee: {
    title: 'Cadastro de Funcionário',
    icon: User,
    accent: 'var(--primary)',
    iconBg: 'var(--primary-light)',
  },
  driver: {
    title: 'Cadastro de Motorista',
    icon: Car,
    accent: 'var(--secondary)',
    iconBg: '#f0fdf4',
  },
};

export default function RegisterForm() {
  const { role: roleParam } = useParams();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const expectedRole = ROLE_BY_REGISTER_PATH[roleParam];
  const ui = ROLE_UI[roleParam];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!expectedRole || !ui) {
    return <Navigate to="/register" replace />;
  }

  const Icon = ui.icon;

  const inputStyle = {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    fontSize: '1rem',
    backgroundColor: 'white',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Informe seu nome completo.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    const result = await signUp(email.trim(), password, fullName.trim(), expectedRole);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsConfirmation) {
      setSuccess(
        'Conta criada! Enviamos um e-mail de confirmação. Confirme seu e-mail e depois faça login.'
      );
      return;
    }

    navigate(HOME_BY_ROLE[expectedRole], { replace: true });
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
          to="/register"
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
            Preencha seus dados para criar sua conta.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nome completo</span>
            <input
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>E-mail</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Senha</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Confirmar senha</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
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

          {success && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
              }}
            >
              {success}{' '}
              <Link to={`/login/${roleParam}`} style={{ color: '#15803d', fontWeight: 700 }}>
                Ir para o login
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || Boolean(success)}
            style={{
              marginTop: '0.5rem',
              opacity: submitting || success ? 0.7 : 1,
              cursor: submitting ? 'wait' : 'pointer',
            }}
          >
            {submitting ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Já tem uma conta?{' '}
          <Link to={`/login/${roleParam}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
