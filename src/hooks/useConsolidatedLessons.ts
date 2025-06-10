
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

  // CRITICAL: Flag to control automatic initialization
  const hasUserInteracted = useRef(false);
  const initializationBlocked = useRef(false);

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

  // MAIN FUNCTION: Lesson selection handling with absolute priority for manual
  const handleSelectLesson = useCallback((lesson: any, isManualSelection = true) => {
    console.log('🎯 handleSelectLesson called with:', lesson.title, 'isCompleted:', lesson.isCompleted, 'isLocked:', lesson.isLocked, 'isManual:', isManualSelection);
    
    // MARK USER INTERACTION
    if (isManualSelection) {
      hasUserInteracted.current = true;
      initializationBlocked.current = true;
      console.log('👤 USER INTERACTION: Blocking automatic initialization');
      
      // Unblock initialization after 5 seconds
      setTimeout(() => {
        initializationBlocked.current = false;
        console.log('✅ Initialization unblocked after user interaction timeout');
      }, 5000);
    }
    
    const canSelectLesson = lesson.isCompleted || !lesson.isLocked;
    
    if (!canSelectLesson) {
      console.log('⚠️ Lesson is locked and not completed, cannot select');
      return;
    }
    
    console.log('✅ Lesson can be selected, updating current lesson and starting playback');
    
    // MANUAL PRIORITY: If manual selection, stop any auto-play sequence
    if (isManualSelection) {
      console.log('🎯 Manual lesson selection detected - stopping auto-play sequence');
      setIsPlaying(false);
      
      // OPTIMIZED: Use startTransition for non-urgent UI updates
      startTransition(() => {
        setCurrentLesson(lesson);
      });
      
      // Handle playback immediately
      handleSelectLessonFromPlayback(lesson, true);
    } else {
      // Auto-play sequence (only if not blocked)
      if (!initializationBlocked.current) {
        startTransition(() => {
          setCurrentLesson(lesson);
        });
        handleSelectLessonFromPlayback(lesson, false);
      } else {
        console.log('🚫 Auto-play blocked by recent user interaction');
      }
    }
  }, [setCurrentLesson, handleSelectLessonFromPlayback, setIsPlaying]);

  // CONTROLLED INITIALIZATION: Only if no user interaction
  useEffect(() => {
    if (podcast && user && !initializationBlocked.current && !hasUserInteracted.current) {
      console.log('📊 Initializing podcast with progress data (no user interaction detected)...');
      startTransition(() => {
        initializePodcastWithProgress();
      });
    } else if (initializationBlocked.current) {
      console.log('🚫 Initialization blocked due to recent user interaction');
    }
  }, [podcast?.id, lessonProgress.length, userProgress.length, user?.id, initializePodcastWithProgress]);

  // CURRENT LESSON INITIALIZATION: Only if no user interaction
  useEffect(() => {
    if (podcast && podcast.lessons.length > 0 && user && !initializationBlocked.current && !hasUserInteracted.current) {
      console.log('🎯 Initializing current lesson (no user interaction detected)...');
      startTransition(() => {
        initializeCurrentLesson();
      });
    } else if (initializationBlocked.current) {
      console.log('🚫 Current lesson initialization blocked due to recent user interaction');
    }
  }, [podcast?.lessons?.length, user?.id, initializeCurrentLesson]);

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
