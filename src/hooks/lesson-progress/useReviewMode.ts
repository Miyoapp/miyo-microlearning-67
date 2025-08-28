
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export function useReviewMode() {
  const { user } = useAuth();

  const isInReviewMode = useCallback(async (courseId: string): Promise<boolean> => {
    if (!user) {
      console.log('🔒 No user found for review mode check');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('progress_percentage, is_completed')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) {
        console.error('Error checking review mode:', error);
        return false;
      }

      // If no data found, user hasn't started the course yet
      if (!data) {
        console.log('🔍 No course progress found for course:', courseId);
        return false;
      }

      const isReviewMode = data.is_completed === true && data.progress_percentage === 100;
      console.log('🔍 Review mode check for course:', courseId, 'isReviewMode:', isReviewMode);
      return isReviewMode;
    } catch (error) {
      console.error('Error checking review mode:', error);
      return false;
    }
  }, [user]);

  return { isInReviewMode };
}
