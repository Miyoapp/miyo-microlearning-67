
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

  // SIMPLIFIED: Remove complex control flags
  const hasUserInteracted = useRef(false);
  const isInitialized = useRef(false);

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
    
    // Allow selection of completed lessons for replay and first lesson even if locked state is wrong
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
    
    // Handle playback properly
    if (isManualSelection) {
      console.log('🎵 Manual selection - delegating to playback hook for immediate start');
      handleSelectLessonFromPlayback(lesson, true);
    } else {
      handleSelectLessonFromPlayback(lesson, false);
    }
  }, [setCurrentLesson, handleSelectLessonFromPlayback, podcast]);

  // CRITICAL FIX: Initialize podcast when data is available
  useEffect(() => {
    console.log('🔄 PODCAST INITIALIZATION EFFECT TRIGGERED');
    console.log('🔍 Effect conditions:', {
      hasPodcast: !!podcast,
      podcastId: podcast?.id,
      hasUser: !!user,
      userId: user?.id,
      lessonProgressDefined: lessonProgress !== undefined,
      lessonProgressLength: lessonProgress?.length,
      userProgressDefined: userProgress !== undefined,
      userProgressLength: userProgress?.length,
      isInitialized: isInitialized.current
    });

    if (podcast && user && lessonProgress !== undefined && userProgress !== undefined && !isInitialized.current) {
      console.log('📊 INITIALIZING PODCAST WITH PROGRESS...');
      isInitialized.current = true;
      startTransition(() => {
        initializePodcastWithProgress();
      });
    }
  }, [podcast?.id, user?.id, lessonProgress, userProgress, initializePodcastWithProgress]);

  // CRITICAL FIX: Initialize current lesson after podcast is ready
  useEffect(() => {
    console.log('🎯 CURRENT LESSON INITIALIZATION EFFECT TRIGGERED');
    console.log('🔍 Lesson init conditions:', {
      hasPodcast: !!podcast,
      hasLessons: podcast?.lessons?.length > 0,
      lessonsCount: podcast?.lessons?.length,
      hasUser: !!user,
      hasCurrentLesson: !!currentLesson,
      currentLessonTitle: currentLesson?.title,
      hasUserInteracted: hasUserInteracted.current,
      isInitialized: isInitialized.current
    });

    // Initialize current lesson only after podcast is initialized and no current lesson is set
    if (podcast && podcast.lessons && podcast.lessons.length > 0 && user && !currentLesson && isInitialized.current) {
      console.log('🎯 AUTO-INITIALIZING CURRENT LESSON...');
      startTransition(() => {
        initializeCurrentLesson();
      });
    }
  }, [podcast?.lessons?.length, user?.id, currentLesson, initializeCurrentLesson, isInitialized.current]);

  // Reset initialization flag when podcast changes
  useEffect(() => {
    if (podcast?.id) {
      console.log('🔄 New podcast detected, resetting initialization flag');
      isInitialized.current = false;
      hasUserInteracted.current = false;
    }
  }, [podcast?.id]);

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
