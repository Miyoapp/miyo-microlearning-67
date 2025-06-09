
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
    updateCourseProgress, 
    refetch: refetchCourseProgress 
  } = useUserProgress();

  // CRÍTICO: Flag para controlar la inicialización automática
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

  // FUNCIÓN PRINCIPAL: Manejo de selección con prioridad absoluta para manual
  const handleSelectLesson = useCallback((lesson: any, isManualSelection = true) => {
    console.log('🎯 handleSelectLesson called with:', lesson.title, 'isCompleted:', lesson.isCompleted, 'isLocked:', lesson.isLocked, 'isManual:', isManualSelection);
    
    // MARCAR INTERACCIÓN DEL USUARIO
    if (isManualSelection) {
      hasUserInteracted.current = true;
      initializationBlocked.current = true;
      console.log('👤 USER INTERACTION: Blocking automatic initialization');
      
      // Desbloquear inicialización después de 5 segundos
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
    
    // PRIORIDAD MANUAL: Si es selección manual, detener cualquier auto-play previo
    if (isManualSelection) {
      console.log('🎯 Manual lesson selection detected - stopping auto-play sequence');
      setIsPlaying(false);
      
      // Actualizar inmediatamente sin delay para selecciones manuales
      setCurrentLesson(lesson);
      handleSelectLessonFromPlayback(lesson, true);
    } else {
      // Auto-play sequence (solo si no está bloqueado)
      if (!initializationBlocked.current) {
        setCurrentLesson(lesson);
        handleSelectLessonFromPlayback(lesson, false);
      } else {
        console.log('🚫 Auto-play blocked by recent user interaction');
      }
    }
  }, [setCurrentLesson, handleSelectLessonFromPlayback, setIsPlaying]);

  // INICIALIZACIÓN CONTROLADA: Solo si no hay interacción del usuario
  useEffect(() => {
    if (podcast && user && !initializationBlocked.current && !hasUserInteracted.current) {
      console.log('📊 Initializing podcast with progress data (no user interaction detected)...');
      initializePodcastWithProgress();
    } else if (initializationBlocked.current) {
      console.log('🚫 Initialization blocked due to recent user interaction');
    }
  }, [podcast?.id, lessonProgress.length, userProgress.length, user?.id, initializePodcastWithProgress]);

  // INICIALIZACIÓN DE LECCIÓN ACTUAL: Solo si no hay interacción del usuario
  useEffect(() => {
    if (podcast && podcast.lessons.length > 0 && user && !initializationBlocked.current && !hasUserInteracted.current) {
      console.log('🎯 Initializing current lesson (no user interaction detected)...');
      initializeCurrentLesson();
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
