import { useEffect, useCallback, useRef } from 'react';
import { Podcast } from '@/types';
import { useUserLessonProgress } from './useUserLessonProgress';
import { useUserProgress } from './useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLessonInitialization } from './consolidated-lessons/useLessonInitialization';
import React from 'react';

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
    refetch: refetchCourseProgress,
    updateCourseProgress
  } = useUserProgress();

  // Control más granular de la inicialización
  const hasAutoInitialized = useRef(false);
  const hasUserMadeSelection = useRef(false);
  const hasAutoPositioned = useRef(false);

  // Usar hook especializado solo para inicialización (sin playback que cause conflictos)
  const {
    currentLesson,
    setCurrentLesson,
    initializePodcastWithProgress,
    initializeCurrentLesson
  } = useLessonInitialization(podcast, lessonProgress, userProgress, user, setPodcast);

  // Estados simplificados sin conflicto con useAudioPlayer
  const [isPlaying, setIsPlaying] = React.useState(false);

  // Auto-advance allowed logic (moved from removed useLessonPlayback)
  const isAutoAdvanceAllowed = React.useMemo(() => {
    if (!user || !podcast) return false;
    // Simple auto-advance logic - can be expanded based on user preferences
    return true;
  }, [user, podcast]);

  // Inline lesson completion handling
  const handleLessonComplete = useCallback(() => {
    if (!currentLesson || !podcast || !user) return;
    
    console.log('Handling lesson complete for:', currentLesson.title);
    
    // Mark as complete in database
    markLessonCompleteInDB(currentLesson.id, podcast.id);
    
    // Update local podcast state
    const updatedLessons = podcast.lessons.map(lesson => 
      lesson.id === currentLesson.id 
        ? { ...lesson, isCompleted: true }
        : lesson
    );
    setPodcast({ ...podcast, lessons: updatedLessons });
    
    // Update lesson position to 100%
    updateLessonPosition(currentLesson.id, podcast.id, currentLesson.duracion || 0);
    
    // Refetch progress data
    refetchLessonProgress();
    refetchCourseProgress();
    
    // Auto-advance if allowed
    if (isAutoAdvanceAllowed) {
      const currentIndex = podcast.lessons.findIndex(l => l.id === currentLesson.id);
      const nextLesson = podcast.lessons[currentIndex + 1];
      
      if (nextLesson) {
        console.log('Auto-advancing to next lesson:', nextLesson.title);
        setCurrentLesson(nextLesson);
        setIsPlaying(true);
        updateLessonPosition(nextLesson.id, podcast.id, 1);
      } else {
        console.log('Course completed - no more lessons');
        setIsPlaying(false);
        // Update course progress if all lessons completed
        const allCompleted = updatedLessons.every(lesson => lesson.isCompleted);
        if (allCompleted) {
          updateCourseProgress(podcast.id, { progress_percentage: 100 });
        }
      }
    } else {
      setIsPlaying(false);
    }
  }, [
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
    isAutoAdvanceAllowed,
    updateCourseProgress
  ]);

  // Simplified progress update handler
  const handleProgressUpdate = useCallback((position: number) => {
    if (!currentLesson || !podcast || !user) return;
    
    console.log('🎯 Progress update:', {
      lessonId: currentLesson.id,
      position,
      timestamp: new Date().toLocaleTimeString()
    });
    
    updateLessonPosition(currentLesson.id, podcast.id, position);
  }, [currentLesson, podcast, user, updateLessonPosition]);

  // Simplified toggle play handler
  const handleTogglePlay = useCallback(() => {
    console.log('🎵 Toggle play:', { 
      currentPlaying: isPlaying,
      lesson: currentLesson?.title 
    });
    
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // SIMPLIFIED: Remove complex audio handling logic, keep only lesson selection logic
  const handleSelectLesson = useCallback((lesson: any, shouldAutoPlay = false) => {
    console.log('🚀 CONSOLIDATED LESSONS handleSelectLesson:', {
      lessonTitle: lesson.title,
      shouldAutoPlay,
      currentLessonId: currentLesson?.id,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Mark user selection
    hasUserMadeSelection.current = true;
    
    // Set the new current lesson
    setCurrentLesson(lesson);
    
    // Set the playing state (this is now mainly for UI state tracking)
    setIsPlaying(shouldAutoPlay);
    
    console.log('✅ CONSOLIDATED LESSONS - Lesson selection complete');
    
  }, [
    currentLesson?.id, 
    setCurrentLesson, 
    setIsPlaying
  ]);

  // CRÍTICO: Inicializar podcast cuando todos los datos estén disponibles
  useEffect(() => {
    console.log('🔄 PODCAST INITIALIZATION EFFECT');
    console.log('🔍 Conditions:', {
      hasPodcast: !!podcast,
      hasUser: !!user,
      lessonProgressDefined: lessonProgress !== undefined,
      userProgressDefined: userProgress !== undefined,
      hasAutoInitialized: hasAutoInitialized.current
    });

    if (podcast && user && lessonProgress !== undefined && userProgress !== undefined && !hasAutoInitialized.current) {
      console.log('📊 ALL DATA AVAILABLE - INITIALIZING PODCAST WITH PROGRESS...');
      initializePodcastWithProgress();
      hasAutoInitialized.current = true;
    }
  }, [podcast?.id, user?.id, lessonProgress, userProgress, initializePodcastWithProgress]);

  // Auto-inicialización inteligente que respeta el progreso del curso
  useEffect(() => {
    console.log('🎯 CURRENT LESSON AUTO-POSITIONING EFFECT');
    console.log('🔍 Conditions:', {
      hasPodcast: !!podcast,
      hasLessons: podcast?.lessons?.length > 0,
      hasUser: !!user,
      currentLessonExists: !!currentLesson,
      hasAutoInitialized: hasAutoInitialized.current,
      hasUserMadeSelection: hasUserMadeSelection.current,
      hasAutoPositioned: hasAutoPositioned.current
    });

    if (
      podcast && 
      podcast.lessons && 
      podcast.lessons.length > 0 && 
      user && 
      !currentLesson && 
      hasAutoInitialized.current && 
      !hasUserMadeSelection.current &&
      !hasAutoPositioned.current
    ) {
      console.log('🎯 AUTO-POSITIONING on next lesson to continue...');
      initializeCurrentLesson();
      hasAutoPositioned.current = true;
    } else if (hasUserMadeSelection.current) {
      console.log('👤 User has made manual selection - skipping auto-initialization');
    }
  }, [
    podcast?.id,
    podcast?.lessons?.length,
    user?.id,
    currentLesson?.id,
    hasAutoInitialized.current,
    initializeCurrentLesson
  ]);

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
