
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isValidSession, shouldRedirectToDashboard } from '../utils/authUtils';

interface UseAuthListenerProps {
  updateAuthState: (session: any) => void;
  clearAuthState: () => void;
  checkEmailVerificationAsync: (userId: string) => Promise<boolean>;
}

export const useAuthListener = ({
  updateAuthState,
  clearAuthState,
  checkEmailVerificationAsync
}: UseAuthListenerProps) => {
  const emailVerificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const authEventCountRef = useRef(0);

  const scheduleEmailVerification = (userId: string, event: string) => {
    const eventCount = ++authEventCountRef.current;
    
    console.log(`🔍 [useAuthListener] Scheduling email verification #${eventCount} for event: ${event}, user: ${userId}`);
    
    // Limpiar timeout anterior
    if (emailVerificationTimeoutRef.current) {
      console.log('🧹 [useAuthListener] Clearing previous email verification timeout');
      clearTimeout(emailVerificationTimeoutRef.current);
    }

    // Programar verificación de email con delay más largo para evitar llamadas inmediatas
    emailVerificationTimeoutRef.current = setTimeout(() => {
      console.log(`🔄 [useAuthListener] Executing email verification #${eventCount} for user: ${userId}`);
      checkEmailVerificationAsync(userId);
    }, 2000); // Aumenté a 2 segundos de delay
  };

  useEffect(() => {
    console.log('🔄 [useAuthListener] Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const eventId = Math.random().toString(36).substr(2, 9);
        console.log(`🔍 [useAuthListener] Auth state changed [${eventId}]:`, event, session ? 'has session' : 'no session');
        console.log(`🔍 [useAuthListener] Session details [${eventId}]:`, {
          userId: session?.user?.id,
          accessToken: session?.access_token ? 'present' : 'missing',
          refreshToken: session?.refresh_token ? 'present' : 'missing'
        });
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log(`🔄 [useAuthListener] Clearing auth state [${eventId}]`);
          clearAuthState();
          // Redirección automática al logout solo si estaba en dashboard
          if (event === 'SIGNED_OUT' && window.location.pathname.startsWith('/dashboard')) {
            console.log(`🔄 [useAuthListener] Redirecting to home after signout [${eventId}]`);
            window.location.href = '/';
          }
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (isValidSession(session)) {
            console.log(`🔄 [useAuthListener] Updating auth state [${eventId}]`);
            // Actualizar estado síncronamente primero
            updateAuthState(session);
            
            // Verificar email de forma asíncrona con delay
            scheduleEmailVerification(session.user.id, event);

            // Redirección automática solo en SIGNED_IN y DIRECTA al dashboard
            if (event === 'SIGNED_IN') {
              const currentPath = window.location.pathname;
              if (shouldRedirectToDashboard(currentPath)) {
                console.log(`🔄 [useAuthListener] Direct redirect to dashboard after successful login [${eventId}]`);
                window.location.href = '/dashboard';
              }
            }
          }
          return;
        }
        
        // Para otros eventos, validar la sesión
        if (isValidSession(session)) {
          console.log(`🔄 [useAuthListener] Updating auth state for other event [${eventId}]:`, event);
          updateAuthState(session);
          
          // Verificar estado de verificación de email de forma asíncrona con delay
          scheduleEmailVerification(session.user.id, event);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log('🔍 [useAuthListener] Initial session check:', session ? 'has session' : 'no session');
      
      if (error) {
        console.error('❌ [useAuthListener] Error getting session:', error);
        clearAuthState();
        return;
      }
      
      if (isValidSession(session)) {
        console.log('🔄 [useAuthListener] Initial session is valid, updating auth state');
        updateAuthState(session);
        
        // Verificar estado de verificación de email de forma asíncrona con delay
        scheduleEmailVerification(session.user.id, 'INITIAL_SESSION');
      } else {
        console.log('🔄 [useAuthListener] Initial session is invalid, clearing auth state');
        clearAuthState();
      }
    });

    return () => {
      console.log('🧹 [useAuthListener] Cleaning up auth listener');
      subscription.unsubscribe();
      if (emailVerificationTimeoutRef.current) {
        clearTimeout(emailVerificationTimeoutRef.current);
      }
    };
  }, [updateAuthState, clearAuthState, checkEmailVerificationAsync]);
};
