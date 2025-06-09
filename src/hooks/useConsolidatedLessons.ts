
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

  // Enhanced lesson selection that prioritizes manual selection over auto-play
  const handleSelectLesson = useCallback((lesson: any, isManualSelection = true) => {
    console.log('🎯 handleSelectLesson called with:', lesson.title, 'isCompleted:', lesson.isCompleted, 'isLocked:', lesson.isLocked, 'isManual:', isManualSelection);
    
    // CORRECCIÓN CRÍTICA: Permitir reproducir CUALQUIER lección completada, independientemente del estado del curso
    // Las lecciones completadas siempre deben ser accesibles
    const canSelectLesson = lesson.isCompleted || !lesson.isLocked;
    
    if (!canSelectLesson) {
      console.log('⚠️ Lesson is locked and not completed, cannot select');
      return;
    }
    
    console.log('✅ Lesson can be selected, updating current lesson and starting playback');
    
    // PRIORIDAD MANUAL: Si es selección manual, detener cualquier auto-play previo
    if (isManualSelection) {
      console.log('🎯 Manual lesson selection detected - stopping auto-play sequence');
      setIsPlaying(false);
      
      // Small delay to ensure clean state transition
      setTimeout(() => {
        setCurrentLesson(lesson);
        handleSelectLessonFromPlayback(lesson);
      }, 100);
    } else {
      // Auto-play sequence
      setCurrentLesson(lesson);
      handleSelectLessonFromPlayback(lesson);
    }
  }, [setCurrentLesson, handleSelectLessonFromPlayback, setIsPlaying]);

  // Initialize cuando podcast o lesson progress cambian
  useEffect(() => {
    if (podcast && user) {
      console.log('📊 Initializing podcast with progress data...');
      initializePodcastWithProgress();
    }
  }, [podcast?.id, lessonProgress.length, userProgress.length, user?.id, initializePodcastWithProgress]);

  // Initialize current lesson cuando podcast está listo
  useEffect(() => {
    if (podcast && podcast.lessons.length > 0 && user) {
      console.log('🎯 Initializing current lesson...');
      initializeCurrentLesson();
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
