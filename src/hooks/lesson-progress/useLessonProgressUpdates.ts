
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { UserLessonProgress, LessonProgressUpdates } from './types';
import { useReviewMode } from './useReviewMode';

export function useLessonProgressUpdates(
  lessonProgress: UserLessonProgress[],
  setLessonProgress: React.Dispatch<React.SetStateAction<UserLessonProgress[]>>
) {
  const { user } = useAuth();
  const { isInReviewMode } = useReviewMode();

  const updateLessonProgress = useCallback(async (
    lessonId: string, 
    courseId: string, 
    updates: LessonProgressUpdates
  ) => {
    if (!user) {
      console.log('No user found, cannot update lesson progress');
      return;
    }

    // Check if course is in review mode
    const reviewMode = await isInReviewMode(courseId);
    if (reviewMode && updates.current_position !== undefined && updates.current_position < 100) {
      console.log('🔒 Course in review mode, skipping progress update for lesson:', lessonId);
      // Still allow lesson completion updates, but not position updates during review
      if (updates.is_completed !== true) {
        return;
      }
    }

    console.log('Updating lesson progress for:', lessonId, 'with updates:', updates);

    try {
      // OPTIMIZACIÓN: Actualizar estado local inmediatamente (optimistic update)
      setLessonProgress(prev => {
        const existing = prev.find(p => p.lesson_id === lessonId);
        const updatedProgress = {
          id: existing?.id || '',
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          created_at: existing?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: existing?.is_completed || false,
          current_position: existing?.current_position || 0,
          ...updates
        };

        // Apply defensive validation to local state
        if (updatedProgress.current_position >= 100) {
          updatedProgress.is_completed = true;
        }
        
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

      // BACKGROUND: Actualizar base de datos sin bloquear UI
      const updateDatabase = async () => {
        // First, get the existing progress to preserve important fields
        const { data: existingData, error: fetchError } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching existing progress:', fetchError);
          throw fetchError;
        }

        // Prepare the data for upsert
        const baseData = {
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // If record exists, use existing values as base
        const existingProgress = existingData || {
          is_completed: false,
          current_position: 0
        };

        // Apply the updates
        const finalData = {
          ...baseData,
          is_completed: existingProgress.is_completed,
          current_position: existingProgress.current_position,
          ...updates
        };

        // DEFENSIVE VALIDATION: If position >= 100, it should be completed
        if (finalData.current_position >= 100) {
          finalData.is_completed = true;
          console.log('🛡️ Defensive validation: Setting is_completed=true because current_position >= 100');
        }

        console.log('Final data for upsert:', finalData);

        const { data, error } = await supabase
          .from('user_lesson_progress')
          .upsert(finalData, {
            onConflict: 'user_id,lesson_id'
          })
          .select();

        if (error) {
          console.error('Error updating lesson progress:', error);
          throw error;
        }
        
        console.log('Successfully updated lesson progress in DB:', data);
        return data;
      };

      // Ejecutar actualización de BD en background
      updateDatabase().catch(error => {
        console.error('Background DB update failed:', error);
        toast.error('Error al actualizar el progreso de la lección');
      });
      
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      toast.error('Error al actualizar el progreso de la lección');
    }
  }, [user, isInReviewMode, setLessonProgress]);

  return { updateLessonProgress };
}
