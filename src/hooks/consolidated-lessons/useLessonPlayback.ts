
import { useState, useCallback, useRef } from 'react';
import { Lesson, Podcast } from '@/types';
import { UserCourseProgress } from '../useUserProgress';

export function useLessonPlayback(
  podcast: Podcast | null,
  currentLesson: Lesson | null,
  userProgress: UserCourseProgress[],
  user: any,
  updateLessonPosition: (lessonId: string, courseId: string, position: number) => void
) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // CRÍTICO: Flag para controlar la prioridad de las acciones
  const manualSelectionActive = useRef(false);
  const autoAdvanceBlocked = useRef(false);

  // Handle lesson selection (PRIORIDAD MANUAL ABSOLUTA)
  const handleSelectLesson = useCallback((lesson: Lesson, isManualSelection = true) => {
    console.log('🎯 Selecting lesson:', lesson.title, 'isCompleted:', lesson.isCompleted, 'isLocked:', lesson.isLocked, 'isManual:', isManualSelection);

    // LÓGICA SIMPLIFICADA: Las lecciones completadas SIEMPRE se pueden reproducir
    const canSelectLesson = lesson.isCompleted || !lesson.isLocked;

    if (!canSelectLesson) {
      console.log('⚠️ Lesson is locked and not completed, cannot select:', lesson.title);
      return;
    }

    // CRÍTICO: Marcar como selección manual para bloquear auto-advance
    if (isManualSelection) {
      console.log('🚫 MANUAL SELECTION: Blocking auto-advance for 3 seconds');
      manualSelectionActive.current = true;
      autoAdvanceBlocked.current = true;
      
      // Desbloquear auto-advance después de 3 segundos
      setTimeout(() => {
        manualSelectionActive.current = false;
        autoAdvanceBlocked.current = false;
        console.log('✅ Auto-advance unblocked after manual selection timeout');
      }, 3000);
    }

    console.log('✅ Lesson can be selected and played:', lesson.title);

    // If selecting the same lesson that's already playing, just toggle play/pause
    if (currentLesson && lesson.id === currentLesson.id && isPlaying) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    // Track lesson start in database (only for incomplete lessons)
    if (podcast && user && !lesson.isCompleted) {
      console.log('📊 Tracking lesson start for incomplete lesson:', lesson.title);
      updateLessonPosition(lesson.id, podcast.id, 1);
    } else if (lesson.isCompleted) {
      console.log('🔄 Replaying completed lesson, not tracking start:', lesson.title);
    }
  }, [currentLesson, isPlaying, podcast, user, updateLessonPosition]);

  // Toggle play/pause
  const handleTogglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Handle progress updates during playback (only for incomplete lessons)
  const handleProgressUpdate = useCallback((position: number) => {
    if (!currentLesson || !podcast || !user) return;
    
    // Never update progress for already completed lessons
    if (currentLesson.isCompleted) {
      console.log('📝 Lesson already completed, not updating progress:', currentLesson.title);
      return;
    }

    // Only update progress for incomplete lessons when position > 5%
    if (position > 5) {
      console.log('📈 Updating progress for incomplete lesson:', currentLesson.title, 'position:', position);
      updateLessonPosition(currentLesson.id, podcast.id, position);
    }
  }, [currentLesson, podcast, user, updateLessonPosition]);

  // NUEVA FUNCIÓN: Verificar si auto-advance está permitido
  const isAutoAdvanceAllowed = useCallback(() => {
    const allowed = !autoAdvanceBlocked.current && !manualSelectionActive.current;
    console.log('🤖 Auto-advance allowed:', allowed, 'manualActive:', manualSelectionActive.current, 'blocked:', autoAdvanceBlocked.current);
    return allowed;
  }, []);

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
