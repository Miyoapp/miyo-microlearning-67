
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
  const lastUpdateTime = useRef(0); // NUEVO: Throttling para progress updates

  // Handle lesson selection with immediate playback for manual selections
  const handleSelectLesson = useCallback((lesson: Lesson, isManualSelection = false) => {
    console.log('🎵 handleSelectLesson:', lesson.title, 'manual:', isManualSelection);
    
    // MEJORADO: Evitar cambios durante transiciones con timeout más corto
    if (isTransitioning.current) {
      console.log('🔄 Transition in progress, skipping selection');
      return;
    }
    
    // Check if lesson is accessible
    if (lesson.isLocked && !lesson.isCompleted) {
      console.log('🚫 Lesson is locked and not completed');
      return;
    }
    
    // OPTIMIZADO: Transición más rápida para manual selections
    if (isManualSelection) {
      isTransitioning.current = true;
      setTimeout(() => {
        isTransitioning.current = false;
      }, 200); // Reducido de 500ms a 200ms
    }
    
    manualSelectionActive.current = isManualSelection;
    
    // Start playback immediately for manual selections
    if (isManualSelection) {
      console.log('▶️ Manual selection - starting playback immediately');
      setIsPlaying(true);
      setIsAutoAdvanceAllowed(true);
    } else {
      setIsPlaying(false);
      setIsAutoAdvanceAllowed(false);
    }
    
    // OPTIMIZADO: Track lesson start solo si es necesario
    if (podcast && !lesson.isCompleted && isManualSelection) {
      updateLessonPosition(lesson.id, podcast.id, 1);
    }
  }, [podcast, updateLessonPosition]);

  const handleTogglePlay = useCallback(() => {
    if (!currentLesson) return;
    
    console.log('🎵 Toggle play - current state:', isPlaying);
    setIsPlaying(!isPlaying);
    
    // Enable auto-advance when manually starting playback
    if (!isPlaying) {
      setIsAutoAdvanceAllowed(true);
    }
  }, [isPlaying, currentLesson]);

  // OPTIMIZADO: Progress updates con throttling
  const handleProgressUpdate = useCallback((position: number) => {
    if (!currentLesson || !podcast || !user) return;
    
    // OPTIMIZACIÓN: Throttling para reducir updates frecuentes
    const now = Date.now();
    if (now - lastUpdateTime.current < 2000) { // Max 1 update cada 2 segundos
      return;
    }
    lastUpdateTime.current = now;
    
    // OPTIMIZACIÓN: Solo actualizar durante transiciones si es completion
    if (isTransitioning.current && position < 95) {
      return;
    }
    
    // Only update progress for incomplete lessons during normal playback
    if (!currentLesson.isCompleted && position > 5) {
      console.log('📊 Throttled progress update:', currentLesson.title, position.toFixed(1) + '%');
      updateLessonPosition(currentLesson.id, podcast.id, position);
    }
  }, [currentLesson, podcast, user, updateLessonPosition]);

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
