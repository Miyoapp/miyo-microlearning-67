
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { UserCourseProgress } from './types';

export function useUserProgressUpdates(
  userProgress: UserCourseProgress[],
  setUserProgress: React.Dispatch<React.SetStateAction<UserCourseProgress[]>>
) {
  const { user } = useAuth();

  const updateCourseProgress = useCallback(async (courseId: string, updates: Partial<UserCourseProgress>) => {
    if (!user) return;

    console.log('📈 Updating course progress:', { courseId, updates });

    try {
      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setUserProgress(prev => {
        const existing = prev.find(p => p.course_id === courseId);
        if (existing) {
          return prev.map(p => 
            p.course_id === courseId 
              ? { ...p, ...updates }
              : p
          );
        } else {
          const newEntry = {
            course_id: courseId,
            progress_percentage: 0,
            is_completed: false,
            is_saved: false,
            last_listened_at: new Date().toISOString(),
            completion_modal_shown: false,
            ...updates
          };
          return [...prev, newEntry];
        }
      });

      console.log('✅ Course progress updated successfully');
    } catch (error) {
      console.error('❌ Error updating course progress:', error);
      toast.error('Error al actualizar el progreso');
    }
  }, [user, setUserProgress]);

  // New function to mark completion modal as shown
  const markCompletionModalShown = useCallback(async (courseId: string) => {
    console.log('✅ Marking completion modal as shown for course:', courseId);
    await updateCourseProgress(courseId, { completion_modal_shown: true });
  }, [updateCourseProgress]);

  return {
    updateCourseProgress,
    markCompletionModalShown
  };
}
