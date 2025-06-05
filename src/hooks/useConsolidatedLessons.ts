
import { useEffect } from 'react';
import { Podcast } from '@/types';
import { useUserLessonProgress } from './useUserLessonProgress';
import { useUserProgress } from './useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLessonInitialization } from './consolidated-lessons/useLessonInitialization';
import { useLessonPlayback } from './consolidated-lessons/useLessonPlayback';
import { useLessonCompletion } from './consolidated-lessons/useLessonCompletion';
import { isCourseCompleted } from './consolidated-lessons/lessonProgressUtils';

export function useConsolidatedLessons(podcast: Podcast | null, setPodcast: (podcast: Podcast) => void) {
  const { user } = useAuth();
  
  const { 
    lessonProgress, 
    markLessonComplete: markLessonCompleteInDB, 
    updateLessonPosition,
    refetch: refetchLessonProgress
  } = useUserLessonProgress();
  
  const { 
    userProgress,
    updateCourseProgress, 
    refetch: refetchCourseProgress 
  } = useUserProgress();

  // Use specialized hooks
  const {
    currentLesson,
    setCurrentLesson,
    initializePodcastWithProgress,
    initializeCurrentLesson
  } = useLessonInitialization(podcast, lessonProgress, userProgress, user, setPodcast);

  const {
    isPlaying,
    setIsPlaying,
    handleSelectLesson: handleSelectLessonFromPlayback,
    handleTogglePlay,
    handleProgressUpdate
  } = useLessonPlayback(podcast, currentLesson, userProgress, user, updateLessonPosition);

  const {
    handleLessonComplete
  } = useLessonCompletion(
    currentLesson,
    podcast,
    user,
    setPodcast,
    setCurrentLesson,
    setIsPlaying,
    markLessonCompleteInDB,
    updateLessonPosition,
    refetchLessonProgress,
    refetchCourseProgress
  );

  // Enhanced lesson selection that updates current lesson and handles playback
  const handleSelectLesson = (lesson: any) => {
    console.log('handleSelectLesson called with:', lesson.title, 'isCompleted:', lesson.isCompleted, 'isLocked:', lesson.isLocked);
    
    const courseCompleted = isCourseCompleted(userProgress, podcast?.id || '');
    
    // Allow selection if:
    // 1. Course is completed (can replay any lesson)
    // 2. Lesson is not locked (available for first time)
    // 3. Lesson is completed (can always replay completed lessons)
    const canSelectLesson = courseCompleted || !lesson.isLocked || lesson.isCompleted;
    
    if (!canSelectLesson) {
      console.log('Lesson is locked and not completed, cannot select');
      return;
    }
    
    // Update current lesson and handle playback
    setCurrentLesson(lesson);
    handleSelectLessonFromPlayback(lesson);
  };

  // Initialize when podcast or lesson progress changes
  useEffect(() => {
    if (podcast && lessonProgress.length >= 0) { // >= 0 to handle empty arrays
      initializePodcastWithProgress();
    }
  }, [podcast?.id, lessonProgress, userProgress, initializePodcastWithProgress]);

  // Initialize current lesson when podcast is ready
  useEffect(() => {
    if (podcast && podcast.lessons.length > 0) {
      initializeCurrentLesson();
    }
  }, [podcast?.lessons, userProgress, initializeCurrentLesson]);

  // Add effect to trigger UI updates when lesson progress changes
  useEffect(() => {
    if (podcast && lessonProgress.length > 0) {
      console.log('Lesson progress updated, refreshing podcast state for UI updates');
      initializePodcastWithProgress();
    }
  }, [lessonProgress, initializePodcastWithProgress]);

  return {
    currentLesson,
    setCurrentLesson,
    isPlaying,
    setIsPlaying,
    initializeCurrentLesson,
    handleSelectLesson,
    handleTogglePlay,
    handleLessonComplete,
    handleProgressUpdate,
    initializePodcastWithProgress
  };
}
