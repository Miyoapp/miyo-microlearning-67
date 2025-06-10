
import { useEffect, useCallback } from 'react';
import { Podcast } from '@/types';
import { useUserLessonProgress } from './useUserLessonProgress';
import { useUserProgress } from './useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLessonInitialization } from './consolidated-lessons/useLessonInitialization';
import { useLessonPlayback } from './consolidated-lessons/useLessonPlayback';
import { useLessonCompletion } from './consolidated-lessons/useLessonCompletion';
import { isFirstLessonInSequence } from './consolidated-lessons/lessonOrderUtils';

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

  // CORREGIDO: Selección de lección con verificación mejorada
  const handleSelectLesson = useCallback((lesson: any, isManualSelection = true) => {
    console.log('🎯 handleSelectLesson called:', lesson.title, 'isCompleted:', lesson.isCompleted ? '🏆' : '❌', 'isLocked:', lesson.isLocked ? '🔒' : '🔓', 'isManual:', isManualSelection);
    
    // MEJORADO: Verificar si la lección es reproducible
    const isFirstInSequence = podcast ? isFirstLessonInSequence(lesson, podcast.lessons, podcast.modules) : false;
    const canSelectLesson = lesson.isCompleted || !lesson.isLocked || isFirstInSequence;
    
    if (!canSelectLesson) {
      console.log('⚠️ Lesson cannot be selected - locked and not completed, not first in sequence');
      return;
    }
    
    const lessonType = lesson.isCompleted ? 'REPLAY (🏆)' : 'PROGRESS (▶)';
    console.log('✅ Setting current lesson:', lesson.title, 'Type:', lessonType);
    
    // Establecer la lección actual primero
    setCurrentLesson(lesson);
    
    // Manejar reproducción
    handleSelectLessonFromPlayback(lesson, isManualSelection);
  }, [setCurrentLesson, handleSelectLessonFromPlayback, podcast]);

  // CRÍTICO: Inicializar podcast cuando todos los datos estén disponibles
  useEffect(() => {
    console.log('🔄 PODCAST INITIALIZATION EFFECT');
    console.log('🔍 Conditions:', {
      hasPodcast: !!podcast,
      hasUser: !!user,
      lessonProgressDefined: lessonProgress !== undefined,
      userProgressDefined: userProgress !== undefined
    });

    if (podcast && user && lessonProgress !== undefined && userProgress !== undefined) {
      console.log('📊 ALL DATA AVAILABLE - INITIALIZING WITH CORRECT SEQUENCE...');
      initializePodcastWithProgress();
    }
  }, [podcast?.id, user?.id, lessonProgress, userProgress, initializePodcastWithProgress]);

  // CRÍTICO: Inicializar lección actual cuando el podcast esté listo
  useEffect(() => {
    console.log('🎯 CURRENT LESSON INITIALIZATION EFFECT');
    console.log('🔍 Conditions:', {
      hasPodcast: !!podcast,
      hasLessons: podcast?.lessons?.length > 0,
      hasUser: !!user,
      currentLessonExists: !!currentLesson
    });

    // CORREGIDO: Solo inicializar si no hay lección actual y se necesita auto-posicionamiento
    if (podcast && podcast.lessons && podcast.lessons.length > 0 && user && !currentLesson) {
      console.log('🎯 ATTEMPTING SMART AUTO-POSITIONING...');
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
