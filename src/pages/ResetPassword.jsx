import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BusFront, KeyRound } from 'lucide-react';
import { useAuth } from '../auth-context';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const loginPath =
    roleParam === 'employee' || roleParam === 'driver' ? `/login/${roleParam}` : '/login';

  const { updatePassword, signOut, session, loading: authLoading } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkRecoverySession() {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setReady(Boolean(data.session?.user));
      setChecking(false);
    }

    checkRecoverySession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && nextSession?.user)) {
        setReady(true);
        setChecking(false);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authLoading && session?.user) {
      setReady(true);
      setChecking(false);
    }
  }, [authLoading, session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    const result = await updatePassword(password);
    if (result.error) {
      setSubmitting(false);
      setError(result.error);
      return;
    }

    await signOut();
    setSubmitting(false);
    setDone(true);
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
          to={loginPath}
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
              backgroundColor: 'var(--primary-light)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
            }}
          >
            <KeyRound size={28} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Nova senha</h1>
          <p
            style={{
              margin: 0,
              color: 'var(--text-primary)',
              fontWeight: 500,
              fontSize: '0.95rem',
            }}
          >
            Escolha uma nova senha para a sua conta MoveCorp.
          </p>
        </div>

        {checking && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Verificando link...</p>
        )}

        {!checking && !ready && !done && (
          <div
            style={{
              backgroundColor: '#fffbeb',
              color: '#92400e',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              fontSize: '0.9rem',
            }}
          >
            <p style={{ margin: '0 0 0.75rem' }}>
              Link inválido ou expirado. Solicite um novo e-mail de recuperação.
            </p>
            <Link
              to={roleParam === 'driver' ? '/forgot-password/driver' : '/forgot-password/employee'}
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              Pedir novo link
            </Link>
          </div>
        )}

        {!checking && ready && !done && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nova senha</span>
              <input
                type="password"
                required
                autoComplete="new-password"
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

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Confirmar senha</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              {submitting ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}

        {done && (
          <div
            style={{
              backgroundColor: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              fontSize: '0.9rem',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: '0 0 1rem' }}>Senha atualizada. Entre com a nova senha.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(loginPath, { replace: true })}
            >
              Ir para o login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
