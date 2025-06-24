
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
  const fetchAttemptRef = useRef(0);
  const lastFetchTimeRef = useRef<number>(0);

  const fetchProfile = useCallback(async () => {
    const currentAttempt = ++fetchAttemptRef.current;
    const currentTime = Date.now();
    
    console.log(`🔍 [useUserProfile] Fetch attempt #${currentAttempt} - User:`, user?.id || 'none');
    console.log(`🔍 [useUserProfile] Current state - loading: ${loading}, isFetching: ${isFetching}`);
    console.log(`🔍 [useUserProfile] Time since last fetch: ${currentTime - lastFetchTimeRef.current}ms`);

    if (!user) {
      console.log('❌ [useUserProfile] No user found, setting loading to false');
      setLoading(false);
      return;
    }

    // Evitar llamadas duplicadas
    if (isFetching) {
      console.log('🚫 [useUserProfile] Already fetching, skipping attempt #' + currentAttempt);
      return;
    }

    // Evitar llamadas muy frecuentes (menos de 1 segundo)
    if (currentTime - lastFetchTimeRef.current < 1000) {
      console.log('🚫 [useUserProfile] Too frequent call, skipping attempt #' + currentAttempt);
      return;
    }

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      console.log('🔄 [useUserProfile] Aborting previous request');
      abortControllerRef.current.abort();
    }

    setIsFetching(true);
    lastFetchTimeRef.current = currentTime;
    abortControllerRef.current = new AbortController();

    try {
      console.log('🔄 [useUserProfile] Starting fetch for user:', user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // Verificar si la petición fue cancelada
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🔄 [useUserProfile] Request was aborted');
        return;
      }
      
      if (error) {
        console.error('❌ [useUserProfile] Error loading user profile:', error);
        // Fallback to user data
        const fallbackProfile = {
          id: user.id,
          name: user.email || 'Usuario',
          email: user.email || '',
          created_at: new Date().toISOString(),
          email_verified: false
        };
        console.log('🔄 [useUserProfile] Using fallback profile:', fallbackProfile);
        setProfile(fallbackProfile);
      } else {
        console.log('✅ [useUserProfile] Profile loaded successfully:', profile);
        setProfile(profile);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🔄 [useUserProfile] Fetch was cancelled');
        return;
      }
      console.error('❌ [useUserProfile] Error loading user profile:', error);
      // Fallback to user data
      const fallbackProfile = {
        id: user.id,
        name: user.email || 'Usuario',
        email: user.email || '',
        created_at: new Date().toISOString(),
        email_verified: false
      };
      console.log('🔄 [useUserProfile] Using fallback profile after error:', fallbackProfile);
      setProfile(fallbackProfile);
    } finally {
      console.log('🏁 [useUserProfile] Fetch completed, setting states to false');
      setLoading(false);
      setIsFetching(false);
      abortControllerRef.current = null;
    }
  }, [user?.id, isFetching]); // Dependencias más específicas

  useEffect(() => {
    console.log('🔄 [useUserProfile] useEffect triggered with user:', user?.id || 'none');
    console.log('🔄 [useUserProfile] useEffect dependencies - user.id:', user?.id);
    
    fetchProfile();
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 [useUserProfile] Cleanup: aborting requests');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user?.id]); // Solo depender del user.id

  return {
    profile,
    loading,
    isFetching,
    refetch: fetchProfile
  };
}
