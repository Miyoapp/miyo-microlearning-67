
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isValidSession, shouldRedirectToDashboard } from '../utils/authUtils';

interface UseAuthListenerProps {
  updateAuthState: (session: any) => void;
  clearAuthState: () => void;
  checkEmailVerificationAsync: (userId: string) => void;
}

export const useAuthListener = ({
  updateAuthState,
  clearAuthState,
  checkEmailVerificationAsync
}: UseAuthListenerProps) => {
  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'has session' : 'no session');
        
        if (event === 'SIGNED_OUT' || !session) {
          clearAuthState();
          // Redirección automática al logout solo si estaba en dashboard
          if (event === 'SIGNED_OUT' && window.location.pathname.startsWith('/dashboard')) {
            console.log('Redirecting to home after signout...');
            window.location.href = '/';
          }
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (isValidSession(session)) {
            // Actualizar estado síncronamente primero
            updateAuthState(session);
            
            // Verificar email de forma asíncrona sin bloquear
            setTimeout(() => {
              checkEmailVerificationAsync(session.user.id);
            }, 0);

            // Redirección automática solo en SIGNED_IN y DIRECTA al dashboard
            if (event === 'SIGNED_IN') {
              const currentPath = window.location.pathname;
              if (shouldRedirectToDashboard(currentPath)) {
                console.log('Direct redirect to dashboard after successful login');
                window.location.href = '/dashboard';
              }
            }
          }
          return;
        }
        
        // Para otros eventos, validar la sesión
        if (isValidSession(session)) {
          updateAuthState(session);
          
          // Verificar estado de verificación de email de forma asíncrona
          setTimeout(() => {
            checkEmailVerificationAsync(session.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        clearAuthState();
        return;
      }
      
      if (isValidSession(session)) {
        updateAuthState(session);
        
        // Verificar estado de verificación de email de forma asíncrona
        setTimeout(() => {
          checkEmailVerificationAsync(session.user.id);
        }, 0);
      } else {
        clearAuthState();
      }
    });

    return () => subscription.unsubscribe();
  }, [updateAuthState, clearAuthState, checkEmailVerificationAsync]);
};
