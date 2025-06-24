
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

  const checkEmailVerificationAsync = async (userId: string) => {
    // Evitar llamadas duplicadas
    if (isChecking) {
      console.log('🚫 Email verification already in progress, skipping...');
      return isEmailVerified;
    }

    // Verificar cache (válido por 30 segundos)
    const now = Date.now();
    if (cacheRef.current && 
        cacheRef.current.userId === userId && 
        (now - cacheRef.current.timestamp) < 30000) {
      console.log('📋 Using cached email verification result:', cacheRef.current.verified);
      setIsEmailVerified(cacheRef.current.verified);
      return cacheRef.current.verified;
    }

    // Limpiar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Implementar debouncing
    return new Promise<boolean>((resolve) => {
      debounceTimeoutRef.current = setTimeout(async () => {
        if (isChecking) {
          resolve(isEmailVerified);
          return;
        }

        setIsChecking(true);
        
        try {
          console.log('🔄 Checking email verification for user:', userId);
          
          const { data, error } = await supabase
            .from('profiles')
            .select('email_verified')
            .eq('id', userId)
            .single();
          
          if (error) {
            console.error('Error checking email verification:', error);
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
          
          console.log('✅ Email verification result:', verified);
          setIsEmailVerified(verified);
          resolve(verified);
        } catch (error) {
          console.error('Error checking email verification:', error);
          setIsEmailVerified(false);
          resolve(false);
        } finally {
          setIsChecking(false);
        }
      }, 300); // 300ms debounce
    });
  };

  return {
    isEmailVerified,
    setIsEmailVerified,
    checkEmailVerificationAsync,
    isChecking
  };
};
