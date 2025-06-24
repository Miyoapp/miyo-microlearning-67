
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  email_verified: boolean;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Evitar llamadas duplicadas
    if (isFetching) {
      console.log('🚫 Profile fetch already in progress, skipping...');
      return;
    }

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsFetching(true);
    abortControllerRef.current = new AbortController();

    try {
      console.log('🔄 Fetching user profile for user:', user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .abortSignal(abortControllerRef.current.signal);
      
      if (error) {
        console.error('Error loading user profile:', error);
        // Fallback to user data
        setProfile({
          id: user.id,
          name: user.email || 'Usuario',
          email: user.email || '',
          created_at: new Date().toISOString(),
          email_verified: false
        });
      } else {
        console.log('✅ Profile loaded successfully:', profile);
        setProfile(profile);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🔄 Profile fetch was cancelled');
        return;
      }
      console.error('Error loading user profile:', error);
      // Fallback to user data
      setProfile({
        id: user.id,
        name: user.email || 'Usuario',
        email: user.email || '',
        created_at: new Date().toISOString(),
        email_verified: false
      });
    } finally {
      setLoading(false);
      setIsFetching(false);
      abortControllerRef.current = null;
    }
  }, [user, isFetching]);

  useEffect(() => {
    fetchProfile();
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProfile]);

  return {
    profile,
    loading,
    isFetching,
    refetch: fetchProfile
  };
}
