
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
    console.log('🎵🎵🎵 useLessonPlayback - handleSelectLesson RECIBIDO:', {
      lessonTitle: lesson.title,
      manual: isManualSelection,
      isCompleted: lesson.isCompleted,
      reviewMode: isInReviewMode(),
      timestamp: new Date().toLocaleTimeString()
    });
    
    if (isTransitioning.current) {
      console.log('🔄 Transición en progreso, saltando selección');
      return;
    }
    
    // CORREGIDO: Lógica de acceso para permitir lecciones completadas SIEMPRE
    const reviewMode = isInReviewMode();
    const canSelectLesson = lesson.isCompleted || !lesson.isLocked || reviewMode;
    
    if (!canSelectLesson) {
      console.log('🚫 Lección no se puede seleccionar - bloqueada y no completada');
      return;
    }
    
    if (isManualSelection) {
      isTransitioning.current = true;
      setTimeout(() => {
        isTransitioning.current = false;
      }, 200);
    }
    
    manualSelectionActive.current = isManualSelection;
    
    // CORREGIDO: Auto-start playback para selecciones manuales desde la ruta de aprendizaje
    if (isManualSelection) {
      console.log('▶️▶️▶️ SELECCIÓN MANUAL desde ruta de aprendizaje - iniciando reproducción automática');
      console.log('🔊🔊🔊 ESTABLECIENDO isPlaying = TRUE para selección manual');
      setIsPlaying(true);
      setIsAutoAdvanceAllowed(true);
    } else {
      // Para selecciones automáticas (auto-positioning), no iniciar reproducción
      console.log('🎯 Auto-posicionamiento - NO iniciando reproducción');
      setIsPlaying(false);
      setIsAutoAdvanceAllowed(false);
    }
    
    // OPTIMIZADO: Tracking de inicio para todas las lecciones en review mode o incompletas
    if (podcast && isManualSelection) {
      console.log('📊📊📊 TRACKING inicio de lección para:', lesson.isCompleted ? 'lección completada (replay/secuencia)' : 'lección incompleta');
      updateLessonPosition(lesson.id, podcast.id, 1);
    }
  }, [podcast, updateLessonPosition, userProgress, isInReviewMode]);

  const handleTogglePlay = useCallback(() => {
    if (!currentLesson) return;
    
    console.log('🎵🎵🎵 Toggle play - estado actual:', isPlaying, '→ nuevo estado:', !isPlaying);
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
    
    const reviewMode = isInReviewMode();
    
    // CASO 1: Review mode (100% completo) - solo track position, no afectar completion
    if (reviewMode) {
      if (position > 5) {
        console.log('📊 Review mode progress update (position only):', currentLesson.title, position.toFixed(1) + '%');
        updateLessonPosition(currentLesson.id, podcast.id, position);
      }
      return;
    }
    
    // CASO 2: Lección completada en curso en progreso
    if (currentLesson.isCompleted) {
      // CORREGIDO: Permitir tracking de posición para secuencia continua
      if (position > 5) {
        console.log('🏆 Replay/sequence mode - tracking position for continuity:', currentLesson.title, position.toFixed(1) + '%');
        updateLessonPosition(currentLesson.id, podcast.id, position);
      }
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
