
import { useEffect, useCallback } from 'react';
import { Podcast } from '@/types';
import { useUserLessonProgress } from './useUserLessonProgress';
import { useUserProgress } from './useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLessonInitialization } from './consolidated-lessons/useLessonInitialization';
import { useLessonPlayback } from './consolidated-lessons/useLessonPlayback';
import { useLessonCompletion } from './consolidated-lessons/useLessonCompletion';

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
    handleProgressUpdate,
    isAutoAdvanceAllowed
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
    
    // CRITICAL FIX: Allow selection of first lesson even if marked as locked
    const isFirstLesson = podcast?.lessons[0]?.id === lesson.id;
    const canSelectLesson = lesson.isCompleted || !lesson.isLocked || isFirstLesson;
    
    if (!canSelectLesson) {
      console.log('⚠️ Lesson cannot be selected - locked and not completed');
      return;
    }
    
    console.log('✅ Setting current lesson to:', lesson.title);
    
    // Set the current lesson first
    setCurrentLesson(lesson);
    
    // Handle playback
    handleSelectLessonFromPlayback(lesson, isManualSelection);
  }, [setCurrentLesson, handleSelectLessonFromPlayback, podcast]);

  // CRITICAL FIX: Initialize podcast when all data is available
  useEffect(() => {
    console.log('🔄 PODCAST INITIALIZATION EFFECT');
    console.log('🔍 Conditions:', {
      hasPodcast: !!podcast,
      hasUser: !!user,
      lessonProgressDefined: lessonProgress !== undefined,
      userProgressDefined: userProgress !== undefined
    });

    if (podcast && user && lessonProgress !== undefined && userProgress !== undefined) {
      console.log('📊 ALL DATA AVAILABLE - INITIALIZING...');
      initializePodcastWithProgress();
    }
  }, [podcast?.id, user?.id, lessonProgress, userProgress, initializePodcastWithProgress]);

  // CRITICAL FIX: Initialize current lesson when podcast is ready
  useEffect(() => {
    console.log('🎯 CURRENT LESSON INITIALIZATION EFFECT');
    console.log('🔍 Conditions:', {
      hasPodcast: !!podcast,
      hasLessons: podcast?.lessons?.length > 0,
      hasUser: !!user,
      currentLessonExists: !!currentLesson
    });

    // Initialize current lesson when podcast has lessons and no current lesson is set
    if (podcast && podcast.lessons && podcast.lessons.length > 0 && user && !currentLesson) {
      console.log('🎯 INITIALIZING CURRENT LESSON...');
      initializeCurrentLesson();
    }
  }, [podcast?.lessons?.length, podcast?.id, user?.id, currentLesson, initializeCurrentLesson]);

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
