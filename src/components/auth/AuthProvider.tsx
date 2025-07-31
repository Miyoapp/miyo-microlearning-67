import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  forceLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para limpiar completamente el estado
  const clearAuthState = () => {
    console.log('Clearing auth state...');
    setSession(null);
    setUser(null);
    // Limpiar localStorage manualmente como fallback
    localStorage.removeItem('sb-ubsextjrmofwzvhvatcl-auth-token');
    localStorage.removeItem('supabase.auth.token');
  };

  // Función para validar si una sesión es realmente válida
  const isValidSession = (session: Session | null): boolean => {
    if (!session) return false;
    
    // Verificar si la sesión no ha expirado
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    
    if (expiresAt <= now) {
      console.log('Session expired, clearing state');
      clearAuthState();
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session ? 'has session' : 'no session');
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out, clearing state');
          clearAuthState();
          setLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (isValidSession(session)) {
            console.log('Valid session found, setting user');
            setSession(session);
            setUser(session.user);
          }
          setLoading(false);
          return;
        }
        
        // Para otros eventos, validar la sesión
        if (isValidSession(session)) {
          setSession(session);
          setUser(session.user);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        clearAuthState();
        setLoading(false);
        return;
      }
      
      if (isValidSession(session)) {
        setSession(session);
        setUser(session.user);
      } else {
        clearAuthState();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const redirectUrl = `${window.location.origin}/login`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name || email
        }
      }
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      console.log('Starting signOut process...');
      
      // Hacer el signOut en Supabase primero
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during signOut:', error);
      }
      
      // Limpiar el estado local inmediatamente después
      clearAuthState();
      
      console.log('SignOut completed successfully');
    } catch (error) {
      console.error('Exception during signOut:', error);
      // En caso de excepción, forzar la limpieza
      clearAuthState();
    }
  };

  // Función de emergencia para forzar logout
  const forceLogout = () => {
    console.log('Force logout triggered');
    clearAuthState();
    // Intentar signOut sin esperar resultado
    supabase.auth.signOut().catch(console.error);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    forceLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
