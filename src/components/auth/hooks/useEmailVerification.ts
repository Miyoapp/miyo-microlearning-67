
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEmailVerification = () => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const checkEmailVerificationAsync = async (userId: string) => {
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
      
      const verified = data?.email_verified || false;
      setIsEmailVerified(verified);
      return verified;
    } catch (error) {
      console.error('Error checking email verification:', error);
      setIsEmailVerified(false);
      return false;
    }
  };

  return {
    isEmailVerified,
    setIsEmailVerified,
    checkEmailVerificationAsync
  };
};
