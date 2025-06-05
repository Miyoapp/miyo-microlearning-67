
import { useState, useCallback } from 'react';
import { Lesson, Podcast } from '@/types';
import { UserCourseProgress } from '../useUserProgress';
import { isCourseCompleted } from './lessonProgressUtils';

export function useLessonPlayback(
  podcast: Podcast | null,
  currentLesson: Lesson | null,
  userProgress: UserCourseProgress[],
  user: any,
  updateLessonPosition: (lessonId: string, courseId: string, position: number) => void
) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle lesson selection (improved for completed courses)
  const handleSelectLesson = useCallback((lesson: Lesson) => {
    const courseCompleted = isCourseCompleted(userProgress, podcast?.id || '');

    if (!courseCompleted && lesson.isLocked) {
      console.log('Lesson is locked, cannot select:', lesson.title);
      return;
    }

    console.log('Selecting lesson:', lesson.title);
    
    // If selecting the same lesson that's already playing, just toggle play/pause
    if (currentLesson && lesson.id === currentLesson.id && isPlaying) {
      setIsPlaying(false);
      return;
    }

    // Note: setCurrentLesson will be handled by the parent hook
    setIsPlaying(true);

    // Track lesson start in database (only for in-progress courses)
    if (podcast && user && !courseCompleted) {
      updateLessonPosition(lesson.id, podcast.id, 1);
    }
  }, [currentLesson, isPlaying, podcast, user, userProgress, updateLessonPosition]);

  // Toggle play/pause
  const handleTogglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Handle progress updates during playback (only for incomplete courses)
  const handleProgressUpdate = useCallback((position: number) => {
    if (!currentLesson || !podcast || !user) return;
    
    const courseCompleted = isCourseCompleted(userProgress, podcast.id);

    // Only update progress for incomplete courses and incomplete lessons
    if (!courseCompleted && position > 5 && !currentLesson.isCompleted) {
      updateLessonPosition(currentLesson.id, podcast.id, position);
    }
  }, [currentLesson, podcast, user, userProgress, updateLessonPosition]);

  return {
    isPlaying,
    setIsPlaying,
    handleSelectLesson,
    handleTogglePlay,
    handleProgressUpdate
  };
}
