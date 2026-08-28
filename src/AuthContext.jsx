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
    .select('id, email, full_name, role')
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

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        try {
          const nextProfile = await fetchProfile(nextSession.user.id);
          setProfile(nextProfile);
        } catch (err) {
          console.error('Failed to load profile', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password, expectedRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
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
      const label = ROLE_LABELS[expectedRole] || expectedRole;
      return { error: `Este usuário não é ${label}.` };
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

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: Boolean(session?.user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
