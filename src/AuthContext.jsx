import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

const AuthContext = createContext(null);

/** URL segment → profiles.role */
export const ROLE_BY_LOGIN_PATH = {
  employee: 'employee',
  driver: 'driver',
  company: 'admin',
};

export const HOME_BY_ROLE = {
  employee: '/employee',
  driver: '/driver',
  admin: '/company',
};

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
    signOut,
    isAuthenticated: Boolean(session?.user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
