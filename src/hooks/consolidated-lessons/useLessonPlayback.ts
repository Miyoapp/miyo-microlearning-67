
import { useState, useCallback } from 'react';
import { Lesson, Podcast } from '@/types';
import { UserCourseProgress } from '../useUserProgress';
import { isCourseCompleted } from './lessonProgressUtils';

export function useLessonPlayback(
  podcast: Podcast | null,
  currentLesson: Lesson | null,
  userProgress: UserCourseProgress[],
  user: any,
  updateLessonPosition: (lessonId: string, courseId: string, position: number) => void
) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle lesson selection (CORRECCIÓN: Lógica simplificada y clara)
  const handleSelectLesson = useCallback((lesson: Lesson) => {
    console.log('Selecting lesson:', lesson.title, 'isCompleted:', lesson.isCompleted, 'isLocked:', lesson.isLocked);

    // LÓGICA SIMPLIFICADA Y CLARA:
    // 1. Si la lección está completada -> SIEMPRE se puede reproducir (sin importar el estado del curso)
    // 2. Si la lección no está bloqueada -> se puede reproducir
    // 3. Solo bloquear si está bloqueada Y no completada
    const canSelectLesson = lesson.isCompleted || !lesson.isLocked;

    if (!canSelectLesson) {
      console.log('⚠️ Lesson is locked and not completed, cannot select:', lesson.title);
      return;
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

  return {
    isPlaying,
    setIsPlaying,
    handleSelectLesson,
    handleTogglePlay,
    handleProgressUpdate
  };
}
