
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

  // Hook de reproducción centralizado con todos los controles
  const playbackHook = useLessonPlayback({
    podcast,
    currentLesson,
    userProgress,
    user,
    lessonProgress,
    updateLessonPosition
  });

  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    isLoading,
    isAutoAdvanceAllowed,
    handleTogglePlay,
    handleProgressUpdate,
    handleSeek,
    handleSkipBackward,
    handleSkipForward,
    handlePlaybackRateChange,
    handleVolumeChange,
    toggleMute,
    formatTime,
    audioRef
  } = playbackHook;

  // Manejar completación de lección
  const handleLessonComplete = useCallback(() => {
    if (!currentLesson || !podcast || !user) return;
    
    console.log('🎉 Handling lesson complete for:', currentLesson.title);
    
    // Marcar como completa en la base de datos
    markLessonCompleteInDB(currentLesson.id, podcast.id);
    
    // Actualizar estado local del podcast
    const updatedLessons = podcast.lessons.map(lesson => 
      lesson.id === currentLesson.id 
        ? { ...lesson, isCompleted: true }
        : lesson
    );
    setPodcast({ ...podcast, lessons: updatedLessons });
    
    // Actualizar posición a 100%
    updateLessonPosition(currentLesson.id, podcast.id, duration);
    
    // Refetch progress data
    refetchLessonProgress();
    refetchCourseProgress();
    
    // Auto-advance si está habilitado
    if (isAutoAdvanceAllowed) {
      const currentIndex = podcast.lessons.findIndex(l => l.id === currentLesson.id);
      const nextLesson = podcast.lessons[currentIndex + 1];
      
      if (nextLesson && !nextLesson.isLocked) {
        console.log('🔄 Auto-advancing to next lesson:', nextLesson.title);
        setTimeout(() => {
          setCurrentLesson(nextLesson);
          // El audio se iniciará automáticamente cuando se cargue la nueva lección
          setTimeout(() => {
            setIsPlaying(true);
          }, 500);
        }, 1000);
      } else if (!nextLesson) {
        console.log('🏆 Course completed - no more lessons');
        setIsPlaying(false);
        // Actualizar progreso del curso si todas están completadas
        const allCompleted = updatedLessons.every(lesson => lesson.isCompleted);
        if (allCompleted) {
          updateCourseProgress(podcast.id, { progress_percentage: 100 });
        }
      } else {
        console.log('🔒 Next lesson is locked - stopping playback');
        setIsPlaying(false);
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
    updateCourseProgress,
    duration
  ]);

  // Selección de lección simplificada y centralizada
  const handleSelectLesson = useCallback((lesson: any, shouldAutoPlay = false) => {
    console.log('🚀 useConsolidatedLessons - handleSelectLesson:', {
      lessonTitle: lesson.title,
      shouldAutoPlay,
      currentLessonId: currentLesson?.id,
      isSameLesson: currentLesson?.id === lesson.id,
    });
    
    // Verificar si es la misma lección
    const isSameLesson = currentLesson?.id === lesson.id;
    
    if (isSameLesson) {
      // MISMA LECCIÓN: Solo cambiar estado de reproducción
      console.log('🔄 Same lesson - toggling playback:', shouldAutoPlay);
      if (shouldAutoPlay !== isPlaying) {
        handleTogglePlay();
      }
      return;
    }
    
    // LECCIÓN DIFERENTE: Cambio completo
    hasUserMadeSelection.current = true;
    console.log('✅ Changing to different lesson:', lesson.title);
    
    // Cambiar la lección actual
    setCurrentLesson(lesson);
    
    // El hook de playback manejará la carga y reproducción del nuevo audio
    if (shouldAutoPlay) {
      // Dar tiempo para que se establezca la nueva lección y se cargue el audio
      setTimeout(() => {
        setIsPlaying(true);
      }, 200);
    } else {
      setIsPlaying(false);
    }
    
  }, [currentLesson, isPlaying, handleTogglePlay, setCurrentLesson, setIsPlaying]);

  // Función para ir a la lección anterior
  const handlePreviousLesson = useCallback(() => {
    if (!podcast || !currentLesson) return;
    
    const currentIndex = podcast.lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex > 0) {
      const previousLesson = podcast.lessons[currentIndex - 1];
      if (previousLesson && !previousLesson.isLocked) {
        handleSelectLesson(previousLesson, isPlaying);
      }
    }
  }, [podcast, currentLesson, isPlaying, handleSelectLesson]);

  // Función para ir a la siguiente lección
  const handleNextLesson = useCallback(() => {
    if (!podcast || !currentLesson) return;
    
    const currentIndex = podcast.lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < podcast.lessons.length - 1) {
      const nextLesson = podcast.lessons[currentIndex + 1];
      if (nextLesson && !nextLesson.isLocked) {
        handleSelectLesson(nextLesson, isPlaying);
      }
    }
  }, [podcast, currentLesson, isPlaying, handleSelectLesson]);

  // Configurar el callback de completación en el hook de reproducción
  useEffect(() => {
    if (audioRef.current) {
      const handleEnded = () => {
        handleLessonComplete();
      };
      
      audioRef.current.addEventListener('ended', handleEnded);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [audioRef.current, handleLessonComplete]);

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
    // Estado de lecciones
    currentLesson,
    setCurrentLesson,
    
    // Estado de reproducción
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    isLoading,
    
    // Funciones de control de reproducción
    handleTogglePlay,
    handleProgressUpdate,
    handleSeek,
    handleSkipBackward,
    handleSkipForward,
    handlePlaybackRateChange,
    handleVolumeChange,
    toggleMute,
    formatTime,
    
    // Funciones de lecciones
    handleSelectLesson,
    handlePreviousLesson,
    handleNextLesson,
    handleLessonComplete,
    
    // Funciones de inicialización
    initializeCurrentLesson,
    initializePodcastWithProgress,
    
    // Referencias
    audioRef
  };
}
