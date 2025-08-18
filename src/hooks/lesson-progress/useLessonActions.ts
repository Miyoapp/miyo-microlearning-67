
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
      
      // CRÍTICO: Si position >= 100, SIEMPRE marcar como completada
      if (position >= 100) {
        console.log('🎯 CRITICAL: Position >= 100 detected, forcing completion:', lessonId, 'position:', position);
        
        const updates = {
          current_position: 100,
          is_completed: true
        };
        
        console.log('🎯 CRITICAL: Forcing completion with updates:', updates);
        await updateLessonProgress(lessonId, courseId, updates);
        return;
      }
      
      // Escenario 2: Lección ya completada siendo reproducida (replay)
      if (existingProgress?.is_completed) {
        console.log('🔄 Replay of completed lesson - preserving completion status and not updating position:', lessonId);
        return; // MEJORADO: No actualizar posición durante replay
      }
      
      // Escenario 3: Progreso de lección incompleta (< 100%)
      if (!existingProgress?.is_completed && position < 100) {
        console.log('📍 Updating position for incomplete lesson:', lessonId, 'position:', position);
        
        const updates: any = {
          current_position: Math.round(position)
        };

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
