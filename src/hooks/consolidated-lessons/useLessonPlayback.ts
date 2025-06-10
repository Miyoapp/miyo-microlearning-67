
import { useState, useCallback, useRef } from 'react';
import { Podcast, Lesson } from '@/types';
import { User } from '@supabase/supabase-js';
import { UserCourseProgress } from '@/hooks/useUserProgress';

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

  // MEJORADO: Detectar si el curso está en modo revisión (100% completo)
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
    
    // CORREGIDO: Lógica de acceso mejorada - lecciones completadas SIEMPRE reproducibles
    const reviewMode = isInReviewMode();
    const canSelectLesson = reviewMode || lesson.isCompleted || !lesson.isLocked;
    
    if (!canSelectLesson) {
      console.log('🚫 Lesson cannot be selected - locked and not completed');
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
      
      // CRÍTICO: Auto-advance rules - SIEMPRE permitir para continuar secuencia
      console.log('✅ Manual selection - enable auto-advance for sequence continuation');
      setIsAutoAdvanceAllowed(true);
    } else {
      setIsPlaying(false);
      setIsAutoAdvanceAllowed(false);
    }
    
    // OPTIMIZADO: Tracking de inicio para lecciones no completadas o en review mode
    if (podcast && isManualSelection) {
      if (!lesson.isCompleted || reviewMode) {
        console.log('📊 Tracking lesson start for:', lesson.isCompleted ? 'completed lesson in review' : 'incomplete lesson');
        updateLessonPosition(lesson.id, podcast.id, 1);
      } else {
        console.log('🔄 Replay of completed lesson - no tracking needed');
      }
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
    
    // CRÍTICO: Lógica de actualización mejorada para replay vs progreso
    const reviewMode = isInReviewMode();
    
    // CASO 1: Review mode (100% completo) - permitir tracking sin restricciones
    if (reviewMode) {
      if (position > 5) {
        console.log('📊 Review mode progress update:', currentLesson.title, position.toFixed(1) + '%');
        updateLessonPosition(currentLesson.id, podcast.id, position);
      }
      return;
    }
    
    // CASO 2: Lección completada en curso en progreso - NO actualizar progreso
    if (currentLesson.isCompleted) {
      console.log('🔄 Replay mode - skipping progress update for completed lesson:', currentLesson.title);
      return;
    }
    
    // CASO 3: Lección incompleta - actualizar progreso normalmente
    if (position > 5) {
      console.log('📊 Normal progress update:', currentLesson.title, position.toFixed(1) + '%');
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
