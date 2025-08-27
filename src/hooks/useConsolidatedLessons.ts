
import { useEffect, useCallback, useRef } from 'react';
import { Podcast } from '@/types';
import { useUserLessonProgress } from './useUserLessonProgress';
import { useUserProgress } from './useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLessonInitialization } from './consolidated-lessons/useLessonInitialization';
import { useLessonPlayback } from './consolidated-lessons/useLessonPlayback';

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

  // Usar hooks especializados
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

  // FIXED: Lesson selection with proper play/pause handling
  const handleSelectLesson = useCallback((lesson: any, shouldAutoPlay = false) => {
    console.log('🚀🚀🚀 useConsolidatedLessons - handleSelectLesson RECEIVED:', {
      lessonTitle: lesson.title,
      shouldAutoPlay,
      currentLessonId: currentLesson?.id,
      isSameLesson: currentLesson?.id === lesson.id,
      currentGlobalPlayingState: isPlaying,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Check if this is the same lesson
    const isSameLesson = currentLesson?.id === lesson.id;
    
    if (isSameLesson) {
      // SAME LESSON: Toggle play/pause state
      console.log('🔄🔄🔄 SAME lesson - toggling play state from', isPlaying, 'to', shouldAutoPlay);
      setIsPlaying(shouldAutoPlay);
      console.log('✅✅✅ Global isPlaying updated to:', shouldAutoPlay);
      return;
    }
    
    // DIFFERENT LESSON: Full lesson change workflow
    hasUserMadeSelection.current = true;
    console.log('✅✅✅ DIFFERENT lesson selected - changing to:', lesson.title);
    
    // Set the new current lesson
    console.log('📝 Setting currentLesson to:', lesson.title);
    setCurrentLesson(lesson);
    
    // Set playing state
    console.log('🎵 Setting isPlaying to:', shouldAutoPlay);
    setIsPlaying(shouldAutoPlay);
    
    // Handle the lesson change through playback hook
    console.log('🎯 Calling handleSelectLessonFromPlayback');
    handleSelectLessonFromPlayback(lesson, shouldAutoPlay);
    
    console.log('🏁 handleSelectLesson completed for:', lesson.title);
    
  }, [setCurrentLesson, handleSelectLessonFromPlayback, setIsPlaying, currentLesson?.id, isPlaying]);

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
