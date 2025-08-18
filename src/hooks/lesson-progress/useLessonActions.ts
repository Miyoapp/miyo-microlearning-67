
import { useCallback } from 'react';
import { UserLessonProgress } from './types';
import { useReviewMode } from './useReviewMode';

export function useLessonActions(
  lessonProgress: UserLessonProgress[],
  updateLessonProgress: (lessonId: string, courseId: string, updates: any) => Promise<void>
) {
  const { isInReviewMode } = useReviewMode();

  const markLessonComplete = useCallback(async (lessonId: string, courseId: string) => {
    const existingProgress = lessonProgress.find(p => p.lesson_id === lessonId);
    if (existingProgress?.is_completed) {
      console.log('✅ Lesson already completed in DB, skipping update:', lessonId);
      return;
    }

    console.log('🎯 Marking lesson complete for first time:', lessonId);
    await updateLessonProgress(lessonId, courseId, { 
      is_completed: true,
      current_position: 100
    });
  }, [lessonProgress, updateLessonProgress]);

  const updateLessonPosition = useCallback(
    async (lessonId: string, courseId: string, position: number) => {
      const existingProgress = lessonProgress.find(p => p.lesson_id === lessonId);
      
      // CRÍTICO: Proteger progreso en diferentes escenarios
      const reviewMode = await isInReviewMode(courseId);
      
      // Escenario 1: Curso 100% completo (modo revisión)
      if (reviewMode) {
        console.log('🔒 Course in review mode - no progress updates allowed:', lessonId);
        return;
      }
      
      // Escenario 2: Lección ya completada siendo reproducida (replay)
      if (existingProgress?.is_completed) {
        console.log('🔄 Replay of completed lesson - preserving completion status and not updating position:', lessonId);
        return; // MEJORADO: No actualizar posición durante replay
      }
      
      // Escenario 3: Primera completion de lección o progreso de lección incompleta
      if (!existingProgress?.is_completed) {
        console.log('📍 Updating position for incomplete lesson:', lessonId, 'position:', position);
        
        const updates: any = {
          current_position: Math.round(position)
        };

        // Solo marcar como completada si llega al 100%
        if (position >= 100) {
          updates.is_completed = true;
          console.log('🎯 First completion - marking as completed');
        }

        await updateLessonProgress(lessonId, courseId, updates);
      }
    },
    [lessonProgress, isInReviewMode, updateLessonProgress]
  );

  return {
    markLessonComplete,
    updateLessonPosition
  };
}
