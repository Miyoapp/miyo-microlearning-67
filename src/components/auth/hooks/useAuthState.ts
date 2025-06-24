
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { clearLocalStorage } from '../utils/authUtils';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthState = () => {
    console.log('Clearing auth state...');
    setSession(null);
    setUser(null);
    setLoading(false);
    clearLocalStorage();
  };

  const updateAuthState = (newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    setLoading(false);
  };

  return {
    user,
    session,
    loading,
    setUser,
    setSession,
    setLoading,
    clearAuthState,
    updateAuthState
  };
};
