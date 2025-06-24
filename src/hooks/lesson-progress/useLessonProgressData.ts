
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { UserLessonProgress } from './types';

export function useLessonProgressData() {
  const [lessonProgress, setLessonProgress] = useState<UserLessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLessonProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching lesson progress:', error);
        throw error;
      }
      
      console.log('Fetched lesson progress from DB:', data);
      setLessonProgress(data || []);
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      toast.error('Error al cargar el progreso de lecciones');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLessonProgress();
  }, [fetchLessonProgress]);

  return {
    lessonProgress,
    setLessonProgress,
    loading,
    refetch: fetchLessonProgress
  };
}
