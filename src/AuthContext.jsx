import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { AuthContext, ROLE_BY_REGISTER_PATH } from './auth-context';

const ROLE_LABELS = {
  employee: 'funcionário',
  driver: 'motorista',
  admin: 'administrador',
};

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, email, full_name, role, company_id, home_address, work_address, credit_balance, credit_last_top_up'
    )
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const nextSession = data.session ?? null;
      setSession(nextSession);

      if (nextSession?.user) {
        try {
          const nextProfile = await fetchProfile(nextSession.user.id);
          if (mounted) setProfile(nextProfile);
        } catch (err) {
          console.error('Failed to load profile', err);
          if (mounted) setProfile(null);
        }
      } else {
        setProfile(null);
      }

      if (mounted) setLoading(false);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // Keep sync work out of the auth callback; async work here races with signIn navigate.
      setSession(nextSession);

      // Recovery links sometimes land on Site URL instead of /reset-password.
      if (event === 'PASSWORD_RECOVERY' && typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path !== '/reset-password') {
          window.location.replace('/reset-password');
          return;
        }
      }

      if (!nextSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Don't clear an existing matching profile while we refresh (avoids ProtectedRoute bounce).
      fetchProfile(nextSession.user.id)
        .then((nextProfile) => {
          setProfile(nextProfile);
        })
        .catch((err) => {
          console.error('Failed to load profile', err);
          setProfile(null);
        })
        .finally(() => {
          setLoading(false);
        });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password, expectedRole) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        return {
          error:
            'E-mail ou senha incorretos. Confira se está no login certo (Funcionário / Motorista) e se a senha é a mais recente.',
        };
      }
      if (msg.includes('email not confirmed')) {
        return { error: 'Confirme seu e-mail antes de entrar (veja a caixa de entrada).' };
      }
      return { error: error.message };
    }

    let nextProfile;
    try {
      nextProfile = await fetchProfile(data.user.id);
    } catch {
      await supabase.auth.signOut();
      return { error: 'Não foi possível carregar o perfil. Verifique a tabela profiles.' };
    }

    if (!nextProfile?.role) {
      await supabase.auth.signOut();
      return {
        error:
          'Perfil sem role. Crie uma linha em profiles para este usuário no Supabase.',
      };
    }

    if (nextProfile.role !== expectedRole) {
      await supabase.auth.signOut();
      const wanted = ROLE_LABELS[expectedRole] || expectedRole;
      const actual = ROLE_LABELS[nextProfile.role] || nextProfile.role;
      return {
        error: `Esta conta é de ${actual}, não de ${wanted}. Volte e escolha o tipo de login correto.`,
      };
    }

    setSession(data.session);
    setProfile(nextProfile);
    return { error: null, profile: nextProfile };
  };

  const signUp = async (email, password, fullName, role) => {
    if (!ROLE_BY_REGISTER_PATH[role] && role !== 'employee' && role !== 'driver') {
      return { error: 'Cadastro disponível apenas para funcionário ou motorista.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // The `handle_new_user` DB trigger reads this metadata to create the
      // matching row in `profiles` (id, email, full_name, role).
      options: { data: { full_name: fullName, role } },
    });

    if (error) {
      return { error: error.message };
    }

    // When email confirmation is disabled, Supabase returns a live session and
    // the user is logged in immediately. Otherwise `session` is null and the
    // user must confirm their email before signing in.
    if (data.session?.user) {
      setSession(data.session);
      try {
        const nextProfile = await fetchProfile(data.session.user.id);
        setProfile(nextProfile);
        return { error: null, needsConfirmation: false, profile: nextProfile };
      } catch (err) {
        console.error('Failed to load profile after sign up', err);
        return { error: null, needsConfirmation: false, profile: null };
      }
    }

    return { error: null, needsConfirmation: true, profile: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const requestPasswordReset = async (email, rolePath) => {
    const trimmed = email.trim();
    // Keep redirectTo exact (no query). Query strings often fail Redirect URL allow-lists.
    if (rolePath === 'employee' || rolePath === 'driver') {
      try {
        sessionStorage.setItem('movecorp:reset-role', rolePath);
      } catch {
        /* ignore */
      }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return {
      error: null,
      message:
        'Se este e-mail estiver cadastrado, enviamos um link para redefinir a senha. Confira também a caixa de spam.',
    };
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  const changePassword = async (currentPassword, newPassword) => {
    const email = session?.user?.email;
    if (!email) {
      return { error: 'Sessão inválida. Entre novamente.' };
    }

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (reauthError) {
      return { error: 'Senha atual incorreta.' };
    }

    return updatePassword(newPassword);
  };

  const changeEmail = async (newEmail) => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) {
      return { error: 'Informe um e-mail válido.' };
    }

    const { data, error } = await supabase.auth.updateUser({ email: trimmed });
    if (error) {
      return { error: error.message };
    }

    // If confirmation is disabled, sync profiles immediately.
    const confirmedEmail = data?.user?.email;
    if (confirmedEmail && session?.user?.id && confirmedEmail === trimmed) {
      await supabase.from('profiles').update({ email: trimmed }).eq('id', session.user.id);
      try {
        await refreshProfile();
      } catch {
        /* ignore */
      }
    }

    return {
      error: null,
      message:
        'Se o projeto exigir confirmação, enviamos um link para o novo e-mail. Confirme para concluir a troca.',
    };
  };

  const updateDisplayName = async (fullName) => {
    const trimmed = fullName.trim();
    if (!trimmed) {
      return { error: 'Informe um nome.' };
    }
    const userId = session?.user?.id;
    if (!userId) {
      return { error: 'Sessão inválida. Entre novamente.' };
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: trimmed },
    });
    if (authError) {
      return { error: authError.message };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: trimmed })
      .eq('id', userId)
      .select(
        'id, email, full_name, role, company_id, home_address, work_address, credit_balance, credit_last_top_up'
      )
      .single();

    if (error) {
      return { error: error.message };
    }

    setProfile(data);
    return { error: null };
  };

  const refreshProfile = async () => {
    const userId = session?.user?.id;
    if (!userId) return null;
    const nextProfile = await fetchProfile(userId);
    setProfile(nextProfile);
    return nextProfile;
  };

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    loading,
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    updatePassword,
    changePassword,
    changeEmail,
    updateDisplayName,
    refreshProfile,
    setProfile,
    isAuthenticated: Boolean(session?.user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
