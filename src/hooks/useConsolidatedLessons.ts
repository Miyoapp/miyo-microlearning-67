
import { useEffect, useCallback, useRef } from 'react';
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

  // MEJORADO: Control más granular de la inicialización
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

  // MEJORADO: Selección de lección con logs específicos
  const handleSelectLesson = useCallback((lesson: any, isManualSelection = true) => {
    console.log('🚀🚀🚀 useConsolidatedLessons - handleSelectLesson RECIBIDO:', {
      lessonTitle: lesson.title,
      isCompleted: lesson.isCompleted ? '🏆' : '❌',
      isLocked: lesson.isLocked ? '🔒' : '🔓',
      isManual: isManualSelection,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // NUEVO: Marcar que el usuario ha hecho una selección manual
    if (isManualSelection) {
      hasUserMadeSelection.current = true;
      console.log('👤👤👤 SELECCIÓN MANUAL DETECTADA - previniendo auto-inicialización futura');
    }
    
    const lessonType = lesson.isCompleted ? 'COMPLETADA/REPLAY (🏆)' : 'EN PROGRESO (▶)';
    console.log('✅✅✅ ESTABLECIENDO LECCIÓN ACTUAL:', lesson.title, 'Tipo:', lessonType);
    
    // Establecer la lección actual primero
    setCurrentLesson(lesson);
    
    console.log('🔄🔄🔄 LLAMANDO handleSelectLessonFromPlayback con isManualSelection:', isManualSelection);
    handleSelectLessonFromPlayback(lesson, isManualSelection);
    
    // Log del estado después de la selección
    setTimeout(() => {
      console.log('⏰⏰⏰ ESTADO DESPUÉS DE handleSelectLesson - isPlaying:', isPlaying);
    }, 100);
  }, [setCurrentLesson, handleSelectLessonFromPlayback, isPlaying]);

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

  // MEJORADO: Auto-inicialización inteligente que respeta el progreso del curso
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

    // MEJORADO: Solo auto-posicionar si:
    // 1. Tenemos podcast y lecciones
    // 2. No hay lección actual seleccionada
    // 3. El usuario no ha hecho una selección manual
    // 4. Ya se inicializó el podcast con progreso
    // 5. No hemos auto-posicionado antes
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
      console.log('🎯 AUTO-POSITIONING on next lesson to continue (▶)...');
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
