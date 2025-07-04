
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
    if (!user) {
      console.log('No user found, cannot update progress');
      return;
    }

    // Check if course is already 100% complete (review mode)
    const currentProgress = userProgress.find(p => p.course_id === courseId);
    if (currentProgress?.is_completed && currentProgress?.progress_percentage === 100) {
      console.log('🔒 Course already 100% complete, preserving progress in review mode:', courseId);
      // Only allow saving/unsaving in review mode
      if (updates.is_saved !== undefined) {
        const preservedUpdates = {
          is_saved: updates.is_saved,
          last_listened_at: new Date().toISOString()
        };
        updates = preservedUpdates;
      } else {
        return; // Skip other updates in review mode
      }
    }

    console.log('Updating course progress for:', courseId, 'with updates:', updates);

    try {
      const { data, error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          progress_percentage: 0,
          is_completed: false,
          is_saved: false,
          last_listened_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...updates
        }, {
          onConflict: 'user_id,course_id'
        })
        .select();

      if (error) {
        console.error('Error updating course progress:', error);
        throw error;
      }
      
      console.log('Successfully updated course progress in DB:', data);
      
      // Update local state immediately for better UX
      setUserProgress(prev => {
        const existing = prev.find(p => p.course_id === courseId);
        const updatedProgress = {
          course_id: courseId,
          progress_percentage: 0,
          is_completed: false,
          is_saved: false,
          last_listened_at: new Date().toISOString(),
          ...(existing || {}),
          ...updates
        };
        
        if (existing) {
          const newProgress = prev.map(p => 
            p.course_id === courseId 
              ? updatedProgress
              : p
          );
          console.log('Updated local progress state:', newProgress);
          return newProgress;
        } else {
          const newProgress = [...prev, updatedProgress];
          console.log('Added new progress to local state:', newProgress);
          return newProgress;
        }
      });
    } catch (error) {
      console.error('Error updating course progress:', error);
      toast.error('Error al actualizar el progreso');
    }
  }, [user, userProgress, setUserProgress]);

  return { updateCourseProgress };
}
