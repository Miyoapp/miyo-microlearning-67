import { useEffect, useCallback, useRef } from 'react';
import { Podcast } from '@/types';
import { useUserLessonProgress } from './useUserLessonProgress';
import { useUserProgress } from './useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLessonInitialization } from './consolidated-lessons/useLessonInitialization';
import { useLessonPlayback } from './consolidated-lessons/useLessonPlayback';
import { useLessonCompletion } from './consolidated-lessons/useLessonCompletion';
import { startTransition } from 'react';

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

  // FIXED: Simplify control flags
  const hasUserInteracted = useRef(false);

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
    handleProgressUpdate,
    isAutoAdvanceAllowed,
    manualSelectionActive
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
    refetchCourseProgress,
    isAutoAdvanceAllowed
  );

  // MAIN LESSON SELECTION with immediate playback for manual selections
  const handleSelectLesson = useCallback((lesson: any, isManualSelection = true) => {
    console.log('🎯 handleSelectLesson called:', lesson.title, 'isCompleted:', lesson.isCompleted, 'isLocked:', lesson.isLocked, 'isManual:', isManualSelection);
    
    // FIXED: Allow selection of completed lessons for replay and first lesson even if locked state is wrong
    const canSelectLesson = lesson.isCompleted || !lesson.isLocked || (podcast?.lessons[0]?.id === lesson.id);
    
    if (!canSelectLesson) {
      console.log('⚠️ Lesson cannot be selected - locked and not completed');
      return;
    }
    
    // Mark user interaction for manual selections
    if (isManualSelection) {
      hasUserInteracted.current = true;
      console.log('👤 USER INTERACTION: Manual lesson selection');
    }
    
    console.log('✅ Setting current lesson to:', lesson.title);
    
    // Always set the current lesson first
    startTransition(() => {
      setCurrentLesson(lesson);
    });
    
    // FIXED: Handle playback properly - don't interfere with manual selections
    if (isManualSelection) {
      // Manual selection - let playback hook handle immediate playback
      console.log('🎵 Manual selection - delegating to playback hook for immediate start');
      handleSelectLessonFromPlayback(lesson, true);
    } else {
      // Auto-play sequence
      handleSelectLessonFromPlayback(lesson, false);
    }
  }, [setCurrentLesson, handleSelectLessonFromPlayback, podcast]);

  // SIMPLIFIED INITIALIZATION: Initialize podcast when data is available
  useEffect(() => {
    if (podcast && user && lessonProgress !== undefined && userProgress !== undefined) {
      console.log('📊 Initializing podcast with progress...');
      startTransition(() => {
        initializePodcastWithProgress();
      });
    }
  }, [podcast?.id, lessonProgress.length, userProgress.length, user?.id, initializePodcastWithProgress]);

  // CURRENT LESSON INITIALIZATION: After podcast is initialized and no current lesson
  useEffect(() => {
    if (podcast && podcast.lessons.length > 0 && user && !currentLesson && !hasUserInteracted.current) {
      console.log('🎯 Auto-initializing current lesson...');
      startTransition(() => {
        initializeCurrentLesson();
      });
    }
  }, [podcast?.lessons?.length, user?.id, initializeCurrentLesson, currentLesson]);

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
