
import { useState, useCallback, useRef } from 'react';
import { Podcast, Lesson } from '@/types';
import { UserCourseProgress } from '@/hooks/useUserProgress';
import { User } from '@supabase/supabase-js';

export function useLessonPlayback(
  podcast: Podcast | null,
  currentLesson: Lesson | null,
  userProgress: UserCourseProgress[],
  user: User | null,
  updateLessonPosition: (lessonId: string, courseId: string, position: number) => Promise<void>
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoAdvanceAllowed, setIsAutoAdvanceAllowed] = useState(true);
  const manualSelectionActive = useRef(false);
  const isTransitioning = useRef(false);
  const lastUpdateTime = useRef(0);

  // NUEVO: Detectar si el curso está en modo revisión (100% completo)
  const isInReviewMode = useCallback(() => {
    if (!podcast) return false;
    const courseProgress = userProgress.find(p => p.course_id === podcast.id);
    return courseProgress?.is_completed && courseProgress?.progress_percentage === 100;
  }, [podcast, userProgress]);

  const handleSelectLesson = useCallback((lesson: Lesson, isManualSelection = false) => {
    console.log('🎵 handleSelectLesson:', lesson.title, 'manual:', isManualSelection, 'isCompleted:', lesson.isCompleted, 'reviewMode:', isInReviewMode());
    
    if (isTransitioning.current) {
      console.log('🔄 Transition in progress, skipping selection');
      return;
    }
    
    // CORREGIDO: Lógica de acceso mejorada
    const reviewMode = isInReviewMode();
    const canSelectLesson = reviewMode || lesson.isCompleted || !lesson.isLocked;
    
    if (!canSelectLesson) {
      console.log('🚫 Lesson cannot be selected - locked');
      return;
    }
    
    if (isManualSelection) {
      isTransitioning.current = true;
      setTimeout(() => {
        isTransitioning.current = false;
      }, 200);
    }
    
    manualSelectionActive.current = isManualSelection;
    
    // MEJORADO: Auto-advance logic considerando el contexto
    if (isManualSelection) {
      console.log('▶️ Manual selection - starting playback');
      setIsPlaying(true);
      
      // CRÍTICO: Auto-advance rules basadas en el estado de la lección
      if (lesson.isCompleted) {
        console.log('🔄 Selected completed lesson - enable auto-advance for continuation');
        setIsAutoAdvanceAllowed(true);
      } else {
        console.log('🆕 Selected new lesson - enable auto-advance for normal flow');
        setIsAutoAdvanceAllowed(true);
      }
    } else {
      setIsPlaying(false);
      setIsAutoAdvanceAllowed(false);
    }
    
    // OPTIMIZADO: Solo track lesson start si es necesario
    if (podcast && !lesson.isCompleted && isManualSelection && !reviewMode) {
      console.log('📊 Tracking lesson start for incomplete lesson');
      updateLessonPosition(lesson.id, podcast.id, 1);
    }
  }, [podcast, updateLessonPosition, userProgress, isInReviewMode]);

  const handleTogglePlay = useCallback(() => {
    if (!currentLesson) return;
    
    console.log('🎵 Toggle play - current state:', isPlaying);
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      setIsAutoAdvanceAllowed(true);
    }
  }, [isPlaying, currentLesson]);

  const handleProgressUpdate = useCallback((position: number) => {
    if (!currentLesson || !podcast || !user) return;
    
    const now = Date.now();
    if (now - lastUpdateTime.current < 2000) {
      return;
    }
    lastUpdateTime.current = now;
    
    if (isTransitioning.current && position < 95) {
      return;
    }
    
    // CRÍTICO: No actualizar progreso para lecciones completadas en replay
    const reviewMode = isInReviewMode();
    if (currentLesson.isCompleted && !reviewMode) {
      console.log('🔄 Skipping progress update for completed lesson in replay');
      return;
    }
    
    // Solo actualizar progreso para lecciones incompletas o en modo revisión
    if ((!currentLesson.isCompleted || reviewMode) && position > 5) {
      console.log('📊 Progress update:', currentLesson.title, position.toFixed(1) + '%', 'reviewMode:', reviewMode);
      updateLessonPosition(currentLesson.id, podcast.id, position);
    }
  }, [currentLesson, podcast, user, updateLessonPosition, isInReviewMode]);

  return {
    isPlaying,
    setIsPlaying,
    handleSelectLesson,
    handleTogglePlay,
    handleProgressUpdate,
    isAutoAdvanceAllowed,
    manualSelectionActive: manualSelectionActive.current
  };
}
