import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AuthContext from './context';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    try {
      const { data, error } = await supabase.rpc('get_my_access');
      if (!error && data) setProfile(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      console.error('loadProfile error', err);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      if (data.session) loadProfile();
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session ?? null);
        if (data.session) loadProfile();
        if (!data.session) setProfile(null);
      });
    });
    return () => sub?.subscription.unsubscribe();
  }, []);

  const value = {
    session,
    profile,
    loading,
    signIn: (opts) => supabase.auth.signInWithPassword(opts),
    signUp: (opts) => supabase.auth.signUp(opts),
    signOut: () => supabase.auth.signOut(),
    refreshProfile: () => supabase.rpc('get_my_access').then(r => r.data && setProfile(Array.isArray(r.data) ? r.data[0] : r.data))
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
