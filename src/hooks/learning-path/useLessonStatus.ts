
import { useMemo } from 'react';
import { Lesson, Module } from '@/types';
import { isFirstLessonInSequence } from '@/hooks/consolidated-lessons/lessonOrderUtils';

export function useLessonStatus(lessons: Lesson[], modules: Module[], currentLessonId: string | null) {
  // OPTIMIZADO: Memoización más estable con keys específicas
  const lessonStatusMap = useMemo(() => {
    const statusMap = new Map();
    
    // OPTIMIZACIÓN: Crear hash estable para evitar recálculos innecesarios
    const lessonsHash = lessons.map(l => `${l.id}-${l.isCompleted}-${l.isLocked}`).join('|');
    const modulesHash = modules.map(m => `${m.id}-${m.lessonIds.join(',')}`).join('|');
    
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
        isFirstInSequence,
        // NUEVO: Agregar hash para debugging
        _hash: `${lesson.id}-${isCompleted}-${isLocked}-${isCurrent}`
      });
    });
    
    console.log('🔄 useLessonStatus: Recalculated with hash:', { lessonsHash: lessonsHash.slice(0, 50), modulesHash: modulesHash.slice(0, 50) });
    return statusMap;
  }, [
    // ESTABILIZADO: Dependencies más específicas
    lessons.map(l => `${l.id}-${l.isCompleted}-${l.isLocked}`).join('|'),
    modules.map(m => `${m.id}-${m.lessonIds.join(',')}`).join('|'),
    currentLessonId
  ]);

  return lessonStatusMap;
}
