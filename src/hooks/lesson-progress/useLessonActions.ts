
import { useCallback } from 'react';
import { UserLessonProgress } from './types';
import { useReviewMode } from './useReviewMode';

export function useLessonActions(
  lessonProgress: UserLessonProgress[],
  updateLessonProgress: (lessonId: string, courseId: string, updates: any) => Promise<void>
) {
  const { isInReviewMode } = useReviewMode();

  const markLessonComplete = useCallback(async (lessonId: string, courseId: string) => {
    // Check if lesson is already completed to avoid unnecessary updates
    const existingProgress = lessonProgress.find(p => p.lesson_id === lessonId);
    if (existingProgress?.is_completed) {
      console.log('Lesson already completed in DB, skipping update:', lessonId);
      return;
    }

    console.log('Marking lesson complete:', lessonId, 'for course:', courseId);
    await updateLessonProgress(lessonId, courseId, { 
      is_completed: true,
      current_position: 100 // 100% complete
    });
  }, [lessonProgress, updateLessonProgress]);

  const updateLessonPosition = useCallback(
    async (lessonId: string, courseId: string, position: number) => {
      // Check if course is in review mode first
      const reviewMode = await isInReviewMode(courseId);
      if (reviewMode) {
        console.log('🔒 Course in review mode, not updating position for lesson:', lessonId);
        return;
      }

      // Get current state from local state first (for performance)
      const existingProgress = lessonProgress.find(p => p.lesson_id === lessonId);
      
      // CRITICAL: Don't update position for already completed lessons unless explicitly needed
      if (existingProgress?.is_completed && position < 100) {
        console.log('🔒 Lesson already completed, not updating position to lower value:', lessonId, 'current position:', position);
        return;
      }

      console.log('📍 Updating lesson position:', lessonId, 'position:', position, 'existing completion status:', existingProgress?.is_completed);
      
      // Prepare updates - preserve completion status unless position reaches 100%
      const updates: any = {
        current_position: Math.round(position)
      };

      // Only update completion status if position reaches 100% (defensive)
      if (position >= 100) {
        updates.is_completed = true;
        console.log('🎯 Position reached 100%, marking as completed');
      }

      await updateLessonProgress(lessonId, courseId, updates);
    },
    [lessonProgress, isInReviewMode, updateLessonProgress]
  );

  return {
    markLessonComplete,
    updateLessonPosition
  };
}
