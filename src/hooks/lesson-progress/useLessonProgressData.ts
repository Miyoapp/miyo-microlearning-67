
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { UserLessonProgress } from './types';

export function useLessonProgressData() {
  const [lessonProgress, setLessonProgress] = useState<UserLessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchAttemptRef = useRef(0);
  const lastFetchTimeRef = useRef<number>(0);

  const fetchLessonProgress = useCallback(async () => {
    const currentAttempt = ++fetchAttemptRef.current;
    const currentTime = Date.now();
    
    console.log(`🔍 [useLessonProgressData] Fetch attempt #${currentAttempt} - User:`, user?.id || 'none');
    console.log(`🔍 [useLessonProgressData] Current state - loading: ${loading}, isFetching: ${isFetching}`);
    console.log(`🔍 [useLessonProgressData] Time since last fetch: ${currentTime - lastFetchTimeRef.current}ms`);

    if (!user) {
      console.log('❌ [useLessonProgressData] No user found, setting loading to false');
      setLoading(false);
      return;
    }

    // Evitar llamadas duplicadas
    if (isFetching) {
      console.log('🚫 [useLessonProgressData] Already fetching, skipping attempt #' + currentAttempt);
      return;
    }

    // Evitar llamadas muy frecuentes (menos de 1 segundo)
    if (currentTime - lastFetchTimeRef.current < 1000) {
      console.log('🚫 [useLessonProgressData] Too frequent call, skipping attempt #' + currentAttempt);
      return;
    }

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      console.log('🔄 [useLessonProgressData] Aborting previous request');
      abortControllerRef.current.abort();
    }

    setIsFetching(true);
    lastFetchTimeRef.current = currentTime;
    abortControllerRef.current = new AbortController();

    try {
      console.log('🔄 [useLessonProgressData] Starting fetch for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id);

      // Verificar si la petición fue cancelada
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🔄 [useLessonProgressData] Request was aborted');
        return;
      }

      if (error) {
        console.error('❌ [useLessonProgressData] Error fetching lesson progress:', error);
        throw error;
      }
      
      console.log('✅ [useLessonProgressData] Fetched lesson progress:', data?.length || 0, 'records');
      setLessonProgress(data || []);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🔄 [useLessonProgressData] Fetch was cancelled');
        return;
      }
      console.error('❌ [useLessonProgressData] Error fetching lesson progress:', error);
      toast.error('Error al cargar el progreso de lecciones');
    } finally {
      console.log('🏁 [useLessonProgressData] Fetch completed, setting states to false');
      setLoading(false);
      setIsFetching(false);
      abortControllerRef.current = null;
    }
  }, [user?.id, isFetching]); // Dependencias más específicas

  useEffect(() => {
    console.log('🔄 [useLessonProgressData] useEffect triggered with user:', user?.id || 'none');
    console.log('🔄 [useLessonProgressData] useEffect dependencies - user.id:', user?.id);
    
    fetchLessonProgress();
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 [useLessonProgressData] Cleanup: aborting requests');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user?.id]); // Solo depender del user.id

  return {
    lessonProgress,
    setLessonProgress,
    loading,
    isFetching,
    refetch: fetchLessonProgress
  };
}
