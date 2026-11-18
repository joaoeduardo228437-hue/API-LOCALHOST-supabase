import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);
const erroConfiguracao = { code: 'supabase_not_configured' };

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signIn: (email, password) =>
      supabase
        ? supabase.auth.signInWithPassword({ email, password })
        : Promise.resolve({ data: { user: null, session: null }, error: erroConfiguracao }),
    signUp: (email, password, nomeCompleto) =>
      supabase
        ? supabase.auth.signUp({
            email,
            password,
            options: { data: { nome_completo: nomeCompleto } },
          })
        : Promise.resolve({ data: { user: null, session: null }, error: erroConfiguracao }),
    signOut: () =>
      supabase ? supabase.auth.signOut() : Promise.resolve({ error: erroConfiguracao }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
