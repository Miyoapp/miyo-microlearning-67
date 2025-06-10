
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
      console.log('✅ Lesson already completed in DB, skipping update:', lessonId);
      return;
    }

    console.log('🎯 Marking lesson complete for first time:', lessonId, 'for course:', courseId);
    await updateLessonProgress(lessonId, courseId, { 
      is_completed: true,
      current_position: 100 // 100% complete
    });
  }, [lessonProgress, updateLessonProgress]);

  const updateLessonPosition = useCallback(
    async (lessonId: string, courseId: string, position: number) => {
      // Get current lesson state
      const existingProgress = lessonProgress.find(p => p.lesson_id === lessonId);
      
      // CRITICAL FIX: Never update progress for already completed lessons during replay
      if (existingProgress?.is_completed) {
        console.log('🔄 Lesson is completed - allowing replay without affecting progress:', lessonId);
        return; // Allow playback but don't update progress
      }

      // Check if course is in review mode
      const reviewMode = await isInReviewMode(courseId);
      if (reviewMode) {
        console.log('🔒 Course in review mode, not updating position for lesson:', lessonId);
        return;
      }

      console.log('📍 Updating lesson position for incomplete lesson:', lessonId, 'position:', position);
      
      const updates: any = {
        current_position: Math.round(position)
      };

      // Only mark as complete if position reaches 100%
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
