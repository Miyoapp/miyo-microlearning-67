
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendVerificationEmail: () => Promise<{ error: any }>;
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
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Función para limpiar completamente el estado
  const clearAuthState = () => {
    console.log('Clearing auth state...');
    setSession(null);
    setUser(null);
    setIsEmailVerified(false);
    // Limpiar localStorage manualmente como fallback
    localStorage.removeItem('sb-ubsextjrmofwzvhvatcl-auth-token');
    localStorage.removeItem('supabase.auth.token');
  };

  // Función para verificar el estado de verificación del email
  const checkEmailVerification = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error checking email verification:', error);
        return false;
      }
      
      return data?.email_verified || false;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
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
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'has session' : 'no session');
        
        if (event === 'SIGNED_OUT' || !session) {
          clearAuthState();
          setLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (isValidSession(session)) {
            setSession(session);
            setUser(session.user);
            
            // Verificar estado de verificación de email
            const verified = await checkEmailVerification(session.user.id);
            setIsEmailVerified(verified);
          }
          setLoading(false);
          return;
        }
        
        // Para otros eventos, validar la sesión
        if (isValidSession(session)) {
          setSession(session);
          setUser(session.user);
          
          // Verificar estado de verificación de email
          const verified = await checkEmailVerification(session.user.id);
          setIsEmailVerified(verified);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        clearAuthState();
        setLoading(false);
        return;
      }
      
      if (isValidSession(session)) {
        setSession(session);
        setUser(session.user);
        
        // Verificar estado de verificación de email
        const verified = await checkEmailVerification(session.user.id);
        setIsEmailVerified(verified);
      } else {
        clearAuthState();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Mejorar el manejo de errores específicos
        if (error.message.includes('email_not_confirmed') || error.message.includes('Email not confirmed')) {
          return { 
            error: { 
              message: 'Tu email no ha sido verificado. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.',
              code: 'email_not_confirmed'
            } 
          };
        }
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { error: { message: 'Error inesperado durante el inicio de sesión' } };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    // Configurar la URL de redirección para que apunte al login del landing
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

  const resendVerificationEmail = async () => {
    if (!user?.email) {
      return { error: { message: 'No hay usuario autenticado' } };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) {
        return { error };
      }

      toast.success('Email de verificación reenviado');
      return { error: null };
    } catch (error) {
      console.error('Error resending verification email:', error);
      return { error: { message: 'Error al reenviar el email de verificación' } };
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting signOut process...');
      
      // Hacer el signOut en Supabase primero
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during signOut:', error);
        throw error;
      }
      
      // Limpiar el estado local después del signOut exitoso
      clearAuthState();
      
      console.log('SignOut completed successfully');
    } catch (error) {
      console.error('Exception during signOut:', error);
      // En caso de excepción, forzar la limpieza
      clearAuthState();
      throw error;
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
    isEmailVerified,
    signIn,
    signUp,
    signOut,
    resendVerificationEmail,
    forceLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
