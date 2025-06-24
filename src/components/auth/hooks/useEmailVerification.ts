
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailVerificationCache {
  userId: string;
  verified: boolean;
  timestamp: number;
}

export const useEmailVerification = () => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const cacheRef = useRef<EmailVerificationCache | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkAttemptRef = useRef(0);
  const lastCheckTimeRef = useRef<number>(0);

  const checkEmailVerificationAsync = async (userId: string) => {
    const currentAttempt = ++checkAttemptRef.current;
    const currentTime = Date.now();
    
    console.log(`🔍 [useEmailVerification] Check attempt #${currentAttempt} - User:`, userId);
    console.log(`🔍 [useEmailVerification] Current state - isChecking: ${isChecking}`);
    console.log(`🔍 [useEmailVerification] Time since last check: ${currentTime - lastCheckTimeRef.current}ms`);

    // Evitar llamadas duplicadas
    if (isChecking) {
      console.log('🚫 [useEmailVerification] Already checking, skipping attempt #' + currentAttempt);
      return isEmailVerified;
    }

    // Verificar cache (válido por 30 segundos)
    const now = Date.now();
    if (cacheRef.current && 
        cacheRef.current.userId === userId && 
        (now - cacheRef.current.timestamp) < 30000) {
      console.log('📋 [useEmailVerification] Using cached result:', cacheRef.current.verified);
      setIsEmailVerified(cacheRef.current.verified);
      return cacheRef.current.verified;
    }

    // Evitar llamadas muy frecuentes (menos de 2 segundos)
    if (currentTime - lastCheckTimeRef.current < 2000) {
      console.log('🚫 [useEmailVerification] Too frequent call, skipping attempt #' + currentAttempt);
      return isEmailVerified;
    }

    // Limpiar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Implementar debouncing mejorado
    return new Promise<boolean>((resolve) => {
      debounceTimeoutRef.current = setTimeout(async () => {
        if (isChecking) {
          console.log('🚫 [useEmailVerification] Still checking during debounce, resolving with current state');
          resolve(isEmailVerified);
          return;
        }

        setIsChecking(true);
        lastCheckTimeRef.current = currentTime;
        
        try {
          console.log('🔄 [useEmailVerification] Starting email verification check for user:', userId);
          
          const { data, error } = await supabase
            .from('profiles')
            .select('email_verified')
            .eq('id', userId)
            .single();
          
          if (error) {
            console.error('❌ [useEmailVerification] Error checking email verification:', error);
            setIsEmailVerified(false);
            resolve(false);
            return;
          }
          
          const verified = data?.email_verified || false;
          
          // Actualizar cache
          cacheRef.current = {
            userId,
            verified,
            timestamp: now
          };
          
          console.log('✅ [useEmailVerification] Email verification result:', verified);
          setIsEmailVerified(verified);
          resolve(verified);
        } catch (error) {
          console.error('❌ [useEmailVerification] Error checking email verification:', error);
          setIsEmailVerified(false);
          resolve(false);
        } finally {
          console.log('🏁 [useEmailVerification] Check completed, setting isChecking to false');
          setIsChecking(false);
        }
      }, 500); // Aumenté el debounce a 500ms
    });
  };

  return {
    isEmailVerified,
    setIsEmailVerified,
    checkEmailVerificationAsync,
    isChecking
  };
};
