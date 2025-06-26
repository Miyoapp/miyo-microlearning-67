
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
  } = useLessonPlayback(podcast, currentLesson, userProgress, user, updateLessonPosition);

  const { initializeCurrentLesson, initializePodcastWithProgress } = useLessonInitialization(
    podcast,
    userProgress,
    setCurrentLesson,
    playbackSelectLesson
  );

  const { handleLessonComplete, advanceToNextLesson } = useLessonCompletion(
    podcast,
    currentLesson,
    userProgress,
    setCurrentLesson,
    playbackSelectLesson,
    setIsPlaying,
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
