
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { UserCourseProgress } from './types';
import { useQueryClient } from '@tanstack/react-query';
import { userProgressKeys } from '@/hooks/queries/useCachedUserProgress';

export function useUserProgressUpdates(
  userProgress: UserCourseProgress[],
  setUserProgress: React.Dispatch<React.SetStateAction<UserCourseProgress[]>>
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateCourseProgress = useCallback(async (courseId: string, updates: Partial<UserCourseProgress>, forceRefetch = false) => {
    if (!user) return;

    console.log('📈 Updating course progress:', { courseId, updates, forceRefetch });

    try {
      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,course_id'
        });

      if (error) throw error;

      // Update local state IMMEDIATAMENTE
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

      // Invalidar caché de React Query para forzar refetch en Dashboard
      queryClient.invalidateQueries({ queryKey: userProgressKeys.user(user.id) });
      console.log('🔄 Cache invalidated for user progress');
      
      // REFETCH INMEDIATO para casos críticos (como completion)
      if (forceRefetch) {
        console.log('🔄 Force refetching user progress...');
        // Pequeño delay para asegurar que la DB se ha actualizado
        setTimeout(async () => {
          try {
            const { data: freshData } = await supabase
              .from('user_course_progress')
              .select('*')
              .eq('user_id', user.id);
            
            if (freshData) {
              setUserProgress(freshData);
              console.log('✅ Fresh progress data loaded');
            }
          } catch (refetchError) {
            console.error('Error refetching progress:', refetchError);
          }
        }, 50);
      }
      
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
