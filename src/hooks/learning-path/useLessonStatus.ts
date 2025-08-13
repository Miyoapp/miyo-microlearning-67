
import { useMemo } from 'react';
import { Lesson, Module } from '@/types';
import { getOrderedLessons, isFirstLessonInSequence } from '@/hooks/consolidated-lessons/lessonOrderUtils';

export function useLessonStatus(lessons: Lesson[], modules: Module[], currentLessonId: string | null) {
  return useMemo(() => {
    const lessonStatusMap = new Map();
    const orderedLessons = getOrderedLessons(lessons, modules);
    
    console.log('🔍 Computing lesson status for', lessons.length, 'lessons');
    
    lessons.forEach(lesson => {
      const isCompleted = lesson.isCompleted || false;
      const isLocked = lesson.isLocked !== undefined ? lesson.isLocked : true;
      const isCurrent = lesson.id === currentLessonId;
      const isFirstInSequence = isFirstLessonInSequence(lesson, lessons, modules);
      
      // CRÍTICO: Lecciones completadas NUNCA se bloquean visualmente y SIEMPRE son reproducibles
      // - Completadas: Mantienen apariencia de play (▶️) - SIN cambio visual
      // - No completadas desbloqueadas: Play (▶️)  
      // - Bloqueadas: Lock (🔒)
      // - Primera lección: Siempre reproducible
      // - Lección actual: Siempre reproducible
      const canPlay = isCompleted || !isLocked || isFirstInSequence || isCurrent;
      
      const status = {
        isCompleted,
        // CRÍTICO: Lecciones completadas NUNCA están bloqueadas visualmente
        isLocked: isCompleted ? false : (isLocked && !isCurrent),
        isCurrent,
        canPlay,
        isFirstInSequence,
        // Hash optimizado
        _hash: `${isCompleted ? '1' : '0'}-${isCompleted ? '0' : (isLocked && !isCurrent ? '1' : '0')}-${isCurrent ? '1' : '0'}-${canPlay ? '1' : '0'}-${isFirstInSequence ? '1' : '0'}`
      };
      
      console.log(`📚 Lesson "${lesson.title}":`, {
        isCompleted: isCompleted ? '🏆 COMPLETADA (mantiene play)' : '❌',
        isLocked: status.isLocked ? '🔒' : '🔓',
        canPlay: canPlay ? '▶️ REPRODUCIBLE' : '❌',
        isFirstInSequence,
        isCurrent: isCurrent ? '🎵 ACTUAL' : '⏸️',
        visualChange: isCompleted ? 'SIN CAMBIO VISUAL' : 'normal'
      });
      
      lessonStatusMap.set(lesson.id, status);
    });
    
    return lessonStatusMap;
  }, [
    // Dependencias optimizadas
    lessons.map(l => `${l.id}:${l.isCompleted ? '1' : '0'}:${l.isLocked ? '1' : '0'}`).join('|'),
    modules.map(m => `${m.id}:${m.lessonIds.join(',')}`).join('|'),
    currentLessonId
  ]);
}
