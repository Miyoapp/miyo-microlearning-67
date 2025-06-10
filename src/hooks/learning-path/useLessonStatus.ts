
import { useMemo } from 'react';
import { Lesson, Module } from '@/types';
import { isFirstLessonInSequence } from '@/hooks/consolidated-lessons/lessonOrderUtils';

export function useLessonStatus(lessons: Lesson[], modules: Module[], currentLessonId: string | null) {
  // OPTIMIZADO: Memoizar cálculos de estado de lecciones usando orden real (ESTABLE)
  const lessonStatusMap = useMemo(() => {
    const statusMap = new Map();
    
    lessons.forEach(lesson => {
      const isCompleted = lesson.isCompleted;
      const isLocked = lesson.isLocked;
      const isCurrent = currentLessonId === lesson.id;
      
      // CRÍTICO: Verificar si es la primera lección usando orden real
      const isFirstInSequence = isFirstLessonInSequence(lesson, lessons, modules);
      const canPlay = isCompleted || !isLocked || isFirstInSequence;
      
      statusMap.set(lesson.id, {
        isCompleted,
        isLocked,
        isCurrent,
        canPlay,
        isFirstInSequence
      });
    });
    
    return statusMap;
  }, [lessons, modules, currentLessonId]); // ESTABILIZADO: Solo dependencias necesarias

  return lessonStatusMap;
}
