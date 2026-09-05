import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BusFront, KeyRound } from 'lucide-react';
import { useAuth } from '../auth-context';
import { supabase } from '../lib/supabase';

function readStoredRole(searchRole) {
  if (searchRole === 'employee' || searchRole === 'driver') return searchRole;
  try {
    const stored = sessionStorage.getItem('movecorp:reset-role');
    if (stored === 'employee' || stored === 'driver') return stored;
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Turn whatever Supabase put in the URL into an auth session.
 * Supports: ?code= (PKCE), #access_token (implicit), ?token_hash=&type= (OTP).
 */
async function establishSessionFromUrl() {
  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  const errorDescription =
    url.searchParams.get('error_description') || hashParams.get('error_description');
  if (errorDescription) {
    return { error: decodeURIComponent(errorDescription.replace(/\+/g, ' ')) };
  }

  const code = url.searchParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { error: error.message };
    cleanupAuthParams(url);
    return { error: null };
  }

  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') || hashParams.get('type');
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) return { error: error.message };
    cleanupAuthParams(url);
    return { error: null };
  }

  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) return { error: error.message };
    cleanupAuthParams(url);
    return { error: null };
  }

  // Client may already have parsed the URL (detectSessionInUrl)
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) {
    return { error: null };
  }

  return { error: 'Link inválido ou expirado.' };
}

function cleanupAuthParams(url) {
  url.searchParams.delete('code');
  url.searchParams.delete('token_hash');
  url.searchParams.delete('type');
  url.searchParams.delete('error');
  url.searchParams.delete('error_description');
  url.searchParams.delete('error_code');
  const clean = `${url.pathname}${url.search}`;
  window.history.replaceState({}, document.title, clean || '/reset-password');
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = readStoredRole(searchParams.get('role'));
  const loginPath =
    roleParam === 'employee' || roleParam === 'driver' ? `/login/${roleParam}` : '/login';
  const forgotPath =
    roleParam === 'driver' ? '/forgot-password/driver' : '/forgot-password/employee';

  const { updatePassword, signOut } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [linkError, setLinkError] = useState('');
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      setChecking(true);
      setLinkError('');

      const result = await establishSessionFromUrl();
      if (cancelled) return;

      if (result.error) {
        // Give detectSessionInUrl / PASSWORD_RECOVERY a brief moment
        await new Promise((r) => setTimeout(r, 400));
        if (cancelled) return;
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setReady(true);
          setChecking(false);
          return;
        }
        setLinkError(result.error);
        setReady(false);
        setChecking(false);
        return;
      }

      setReady(true);
      setChecking(false);
    }

    boot();

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (
        (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') &&
        nextSession?.user
      ) {
        setReady(true);
        setLinkError('');
        setChecking(false);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

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

    try {
      sessionStorage.removeItem('movecorp:reset-role');
    } catch {
      /* ignore */
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
              {linkError || 'Link inválido ou expirado. Solicite um novo e-mail de recuperação.'}
            </p>
            <Link to={forgotPath} style={{ color: 'var(--primary)', fontWeight: 600 }}>
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
