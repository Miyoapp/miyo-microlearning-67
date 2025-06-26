
import { useState, useCallback, useEffect, useRef } from 'react';
import { Podcast, Lesson } from '@/types';
import { useAuth } from '@/components/auth/AuthProvider';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useLessonPlayback } from '@/hooks/consolidated-lessons/useLessonPlayback';
import { useLessonInitialization } from '@/hooks/consolidated-lessons/useLessonInitialization';
import { useLessonCompletion } from '@/hooks/consolidated-lessons/useLessonCompletion';

export function useConsolidatedLessons(
  podcast: Podcast | null,
  setPodcast: (podcast: Podcast | null) => void
) {
  const { user } = useAuth();
  const { userProgress, updateLessonPosition } = useUserProgress();
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  
  // Use specialized hooks
  const { 
    isPlaying, 
    setIsPlaying,
    handleSelectLesson: playbackSelectLesson,
    handleTogglePlay,
    handleProgressUpdate,
    isAutoAdvanceAllowed,
    manualSelectionActive
  } = useLessonPlayback(
    podcast, 
    currentLesson, 
    userProgress, 
    user, 
    updateLessonPosition
  );

  const { initializeCurrentLesson, initializePodcastWithProgress } = useLessonInitialization(
    podcast,
    userProgress,
    setCurrentLesson,
    playbackSelectLesson
  );

  // Mock functions for missing dependencies - these would need to be implemented properly
  const markLessonCompleteInDB = useCallback(async (lessonId: string, courseId: string) => {
    console.log('Mock: marking lesson complete in DB:', lessonId, courseId);
  }, []);

  const refetchLessonProgress = useCallback(() => {
    console.log('Mock: refetching lesson progress');
  }, []);

  const refetchCourseProgress = useCallback(() => {
    console.log('Mock: refetching course progress');
  }, []);

  const { handleLessonComplete, advanceToNextLesson } = useLessonCompletion(
    currentLesson,
    podcast,
    user,
    setPodcast,
    setCurrentLesson,
    setIsPlaying,
    markLessonCompleteInDB,
    updateLessonPosition,
    refetchLessonProgress,
    refetchCourseProgress,
    isAutoAdvanceAllowed
  );

  // Simplified lesson selection for external components
  const handleSelectLesson = useCallback((lesson: Lesson) => {
    console.log('🎯 External handleSelectLesson called:', lesson.title);
    setCurrentLesson(lesson);
  }, []);

  return {
    currentLesson,
    isPlaying,
    setIsPlaying,
    initializeCurrentLesson,
    initializePodcastWithProgress,
    handleSelectLesson,
    handleTogglePlay,
    handleLessonComplete,
    handleProgressUpdate,
    advanceToNextLesson
  };
}
