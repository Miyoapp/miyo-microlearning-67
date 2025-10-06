
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

    console.log('📊 UPDATING LESSON PROGRESS:', lessonId, 'with updates:', updates);

    try {
      // OPTIMISTIC UPDATE: Update local state immediately
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

        // CRITICAL: Defensive validation in local state
        if (updatedProgress.current_position >= 100) {
          console.log('🛡️ DEFENSIVE VALIDATION (Local): Setting is_completed=true because current_position >= 100');
          updatedProgress.is_completed = true;
          updatedProgress.current_position = 100; // Normalize to exactly 100
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

      // DATABASE UPDATE: Function to update database
      const updateDatabase = async () => {
        // First, get the existing progress to preserve important fields
        const { data: existingData, error: fetchError } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .maybeSingle();

        if (fetchError) {
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

        // Treat null as "no existing progress" - use safe defaults
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

        // CRITICAL: Defensive validation in database
        if (finalData.current_position >= 100) {
          console.log('🛡️ DEFENSIVE VALIDATION (DB): Setting is_completed=true because current_position >= 100');
          finalData.is_completed = true;
          finalData.current_position = 100; // Normalize to exactly 100
        }

        console.log('💾 Final data for database upsert:', finalData);

        const { data, error } = await supabase
          .from('user_lesson_progress')
          .upsert(finalData, {
            onConflict: 'user_id,lesson_id'
          })
          .select();

        if (error) {
          console.error('❌ Error updating lesson progress in DB:', error);
          throw error;
        }
        
        console.log('✅ Successfully updated lesson progress in DB:', data);
        return data;
      };

      // IMPROVED: Execute critical updates immediately
      const isCriticalUpdate = updates.is_completed === true || 
                             (updates.current_position && updates.current_position >= 100);

      if (isCriticalUpdate) {
        console.log('🎯 CRITICAL UPDATE: Executing DB update immediately for completion');
        await updateDatabase();
      } else {
        // For non-critical updates, execute in background
        updateDatabase().catch(error => {
          console.error('Background DB update failed:', error);
          toast.error('Error al actualizar el progreso de la lección');
        });
      }
      
    } catch (error) {
      console.error('❌ Error updating lesson progress:', error);
      toast.error('Error al actualizar el progreso de la lección');
    }
  }, [user, isInReviewMode, setLessonProgress]);

  return { updateLessonProgress };
}
