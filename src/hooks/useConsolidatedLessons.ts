
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

  // Control de inicialización más estricto
  const hasInitialized = useRef(false);
  const hasUserSelected = useRef(false);
  const initializationAttempts = useRef(0);
  const maxInitAttempts = 3;

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

  // Selección de lección simplificada
  const handleSelectLesson = useCallback((lesson: any, isManualSelection = true) => {
    console.log('🎯 [useConsolidatedLessons] handleSelectLesson called:', lesson.title, 'isManual:', isManualSelection);
    
    if (isManualSelection) {
      hasUserSelected.current = true;
      console.log('👤 [useConsolidatedLessons] User made manual selection');
    }
    
    setCurrentLesson(lesson);
    handleSelectLessonFromPlayback(lesson, isManualSelection);
  }, [setCurrentLesson, handleSelectLessonFromPlayback]);

  // CRÍTICO: Solo inicializar cuando tenemos TODOS los datos y NO hemos inicializado antes
  useEffect(() => {
    console.log('🔄 [useConsolidatedLessons] PODCAST INITIALIZATION EFFECT');
    console.log('🔍 [useConsolidatedLessons] Conditions:', {
      hasPodcast: !!podcast,
      hasUser: !!user,
      lessonProgressDefined: lessonProgress !== undefined,
      userProgressDefined: userProgress !== undefined,
      hasInitialized: hasInitialized.current,
      attempts: initializationAttempts.current
    });

    if (
      podcast && 
      user && 
      lessonProgress !== undefined && 
      userProgress !== undefined && 
      !hasInitialized.current &&
      initializationAttempts.current < maxInitAttempts
    ) {
      initializationAttempts.current++;
      console.log(`📊 [useConsolidatedLessons] INITIALIZING PODCAST WITH PROGRESS (attempt ${initializationAttempts.current})...`);
      initializePodcastWithProgress();
      hasInitialized.current = true;
    }
  }, [podcast?.id, user?.id, lessonProgress, userProgress, initializePodcastWithProgress]);

  // Auto-inicialización de lección actual - MUY controlada
  useEffect(() => {
    console.log('🎯 [useConsolidatedLessons] CURRENT LESSON AUTO-INITIALIZATION EFFECT');
    console.log('🔍 [useConsolidatedLessons] Conditions:', {
      hasPodcast: !!podcast,
      hasLessons: podcast?.lessons?.length > 0,
      hasUser: !!user,
      currentLessonExists: !!currentLesson,
      hasInitialized: hasInitialized.current,
      hasUserSelected: hasUserSelected.current
    });

    // SOLO auto-inicializar si:
    // 1. Tenemos curso, lecciones y usuario
    // 2. No hay lección actual
    // 3. El usuario NO ha hecho selección manual
    // 4. Ya se inicializó el podcast
    if (
      podcast && 
      podcast.lessons && 
      podcast.lessons.length > 0 && 
      user && 
      !currentLesson && 
      hasInitialized.current && 
      !hasUserSelected.current
    ) {
      console.log('🎯 [useConsolidatedLessons] AUTO-POSITIONING to next lesson...');
      initializeCurrentLesson();
    }
  }, [
    podcast?.id,
    podcast?.lessons?.length,
    user?.id,
    currentLesson?.id,
    initializeCurrentLesson
  ]);

  // Reset cuando cambia el curso
  useEffect(() => {
    console.log('🔄 [useConsolidatedLessons] Course changed, resetting state');
    hasInitialized.current = false;
    hasUserSelected.current = false;
    initializationAttempts.current = 0;
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
