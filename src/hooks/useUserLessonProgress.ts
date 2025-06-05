
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  is_completed: boolean;
  current_position: number;
  created_at: string;
  updated_at: string;
}

export function useUserLessonProgress() {
  const [lessonProgress, setLessonProgress] = useState<UserLessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLessonProgress = async () => {
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
  };

  const updateLessonProgress = async (
    lessonId: string, 
    courseId: string, 
    updates: Partial<Pick<UserLessonProgress, 'is_completed' | 'current_position'>>
  ) => {
    if (!user) {
      console.log('No user found, cannot update lesson progress');
      return;
    }

    console.log('Updating lesson progress for:', lessonId, 'with updates:', updates);

    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          is_completed: false,
          current_position: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...updates
        }, {
          onConflict: 'user_id,lesson_id'
        })
        .select();

      if (error) {
        console.error('Error updating lesson progress:', error);
        throw error;
      }
      
      console.log('Successfully updated lesson progress in DB:', data);
      
      // Update local state
      setLessonProgress(prev => {
        const existing = prev.find(p => p.lesson_id === lessonId);
        const updatedProgress = {
          id: data[0]?.id || '',
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          is_completed: false,
          current_position: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...(existing || {}),
          ...updates
        };
        
        if (existing) {
          return prev.map(p => 
            p.lesson_id === lessonId 
              ? updatedProgress
              : p
          );
        } else {
          return [...prev, updatedProgress];
        }
      });
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      toast.error('Error al actualizar el progreso de la lección');
    }
  };

  const markLessonComplete = async (lessonId: string, courseId: string) => {
    console.log('Marking lesson complete:', lessonId, 'for course:', courseId);
    await updateLessonProgress(lessonId, courseId, { 
      is_completed: true,
      current_position: 100 // 100% complete
    });
  };

  const updateLessonPosition = async (lessonId: string, courseId: string, position: number) => {
    console.log('Updating lesson position:', lessonId, 'position:', position);
    await updateLessonProgress(lessonId, courseId, { current_position: position });
  };

  useEffect(() => {
    if (user) {
      console.log('User found, fetching lesson progress for:', user.id);
      fetchLessonProgress();
    } else {
      console.log('No user found, clearing lesson progress');
      setLessonProgress([]);
      setLoading(false);
    }
  }, [user]);

  return {
    lessonProgress,
    loading,
    updateLessonProgress,
    markLessonComplete,
    updateLessonPosition,
    refetch: fetchLessonProgress
  };
}
