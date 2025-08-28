
import { useCallback } from 'react';
import { Podcast, Lesson } from '@/types';
import { User } from '@supabase/supabase-js';
import { UserCourseProgress } from '@/hooks/useUserProgress';

export function useLessonPlayback(
  podcast: Podcast | null,
  currentLesson: Lesson | null,
  userProgress: UserCourseProgress[],
  user: User | null,
  updateLessonPosition: (lessonId: string, courseId: string, position: number) => Promise<void>
) {
  // Check if course is in review mode (100% completed)
  const isInReviewMode = useCallback(() => {
    if (!podcast) return false;
    const courseProgress = userProgress.find(p => p.course_id === podcast.id);
    return courseProgress?.is_completed && courseProgress?.progress_percentage === 100;
  }, [podcast, userProgress]);

  // Handle lesson selection logic
  const handleSelectLesson = useCallback((lesson: Lesson, isManualSelection = false) => {
    console.log('🎵 useLessonPlayback - handleSelectLesson:', {
      lessonTitle: lesson.title,
      manual: isManualSelection,
      isCompleted: lesson.isCompleted,
      reviewMode: isInReviewMode()
    });
    
    const reviewMode = isInReviewMode();
    const canSelectLesson = lesson.isCompleted || !lesson.isLocked || reviewMode;
    
    if (!canSelectLesson) {
      console.log('🚫 Lesson cannot be selected - locked and not completed');
      return false;
    }
    
    // Track lesson start for manual selections
    if (podcast && isManualSelection) {
      console.log('📊 Tracking lesson start for:', lesson.isCompleted ? 'completed lesson (replay)' : 'incomplete lesson');
      updateLessonPosition(lesson.id, podcast.id, 1);
    }
    
    return true;
  }, [podcast, updateLessonPosition, userProgress, isInReviewMode]);

  return {
    handleSelectLesson,
    isInReviewMode
  };
}
