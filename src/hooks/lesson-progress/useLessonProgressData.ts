
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

  const fetchLessonProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Evitar llamadas duplicadas
    if (isFetching) {
      console.log('🚫 Lesson progress fetch already in progress, skipping...');
      return;
    }

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsFetching(true);
    abortControllerRef.current = new AbortController();

    try {
      console.log('🔄 Fetching lesson progress for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .abortSignal(abortControllerRef.current.signal);

      if (error) {
        console.error('Error fetching lesson progress:', error);
        throw error;
      }
      
      console.log('✅ Fetched lesson progress from DB:', data?.length || 0, 'records');
      setLessonProgress(data || []);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🔄 Lesson progress fetch was cancelled');
        return;
      }
      console.error('Error fetching lesson progress:', error);
      toast.error('Error al cargar el progreso de lecciones');
    } finally {
      setLoading(false);
      setIsFetching(false);
      abortControllerRef.current = null;
    }
  }, [user, isFetching]);

  useEffect(() => {
    fetchLessonProgress();
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchLessonProgress]);

  return {
    lessonProgress,
    setLessonProgress,
    loading,
    isFetching,
    refetch: fetchLessonProgress
  };
}
