
import { useEffect, useCallback, useRef } from 'react';
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

  // NUEVO: Flag para controlar la inicialización automática
  const hasAutoInitialized = useRef(false);
  const hasUserMadeSelection = useRef(false);

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

  // CORREGIDO: Selección de lección mejorada que marca la intervención manual
  const handleSelectLesson = useCallback((lesson: any, isManualSelection = true) => {
    console.log('🎯 handleSelectLesson called:', lesson.title, 'isCompleted:', lesson.isCompleted ? '🏆' : '❌', 'isLocked:', lesson.isLocked ? '🔒' : '🔓', 'isManual:', isManualSelection);
    
    // Verificar si la lección es reproducible (completadas SIEMPRE reproducibles)
    const isFirstInSequence = podcast ? isFirstLessonInSequence(lesson, podcast.lessons, podcast.modules) : false;
    const canSelectLesson = lesson.isCompleted || !lesson.isLocked || isFirstInSequence;
    
    if (!canSelectLesson) {
      console.log('⚠️ Lesson cannot be selected - locked and not completed, not first in sequence');
      return;
    }
    
    // NUEVO: Marcar que el usuario ha hecho una selección manual
    if (isManualSelection) {
      hasUserMadeSelection.current = true;
      console.log('👤 User made manual selection - preventing future auto-initialization');
    }
    
    const lessonType = lesson.isCompleted ? 'COMPLETED/REPLAY (🏆)' : 'PROGRESS (▶)';
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
      userProgressDefined: userProgress !== undefined,
      hasAutoInitialized: hasAutoInitialized.current
    });

    if (podcast && user && lessonProgress !== undefined && userProgress !== undefined && !hasAutoInitialized.current) {
      console.log('📊 ALL DATA AVAILABLE - INITIALIZING PODCAST WITH PROGRESS...');
      initializePodcastWithProgress();
      hasAutoInitialized.current = true;
    }
  }, [podcast?.id, user?.id, lessonProgress, userProgress, initializePodcastWithProgress]);

  // CRÍTICO: Auto-inicialización inteligente de lección actual (solo una vez y si no hay selección manual)
  useEffect(() => {
    console.log('🎯 CURRENT LESSON AUTO-INITIALIZATION EFFECT');
    console.log('🔍 Conditions:', {
      hasPodcast: !!podcast,
      hasLessons: podcast?.lessons?.length > 0,
      hasUser: !!user,
      currentLessonExists: !!currentLesson,
      hasAutoInitialized: hasAutoInitialized.current,
      hasUserMadeSelection: hasUserMadeSelection.current
    });

    // CORREGIDO: Solo auto-inicializar si:
    // 1. Tenemos podcast y lecciones
    // 2. No hay lección actual seleccionada
    // 3. El usuario no ha hecho una selección manual
    // 4. Ya se inicializó el podcast con progreso
    if (
      podcast && 
      podcast.lessons && 
      podcast.lessons.length > 0 && 
      user && 
      !currentLesson && 
      hasAutoInitialized.current && 
      !hasUserMadeSelection.current
    ) {
      console.log('🎯 AUTO-POSITIONING on next lesson to continue (▶)...');
      initializeCurrentLesson();
    } else if (hasUserMadeSelection.current) {
      console.log('👤 User has made manual selection - skipping auto-initialization');
    }
  }, [
    // ESTABILIZADO: Dependencias más específicas para evitar re-ejecuciones
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
