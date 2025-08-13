
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
      
      // CORREGIDO: Lógica de reproducción mejorada
      // - Lecciones completadas (🏆) SIEMPRE reproducibles (para replay)
      // - Lecciones desbloqueadas (▶️) reproducibles  
      // - Primera lección siempre reproducible
      const canPlay = isCompleted || !isLocked || isFirstInSequence;
      
      const status = {
        isCompleted,
        isLocked,
        isCurrent,
        canPlay,
        isFirstInSequence,
        // Hash mejorado para optimización
        _hash: `${isCompleted ? '1' : '0'}-${isLocked ? '1' : '0'}-${isCurrent ? '1' : '0'}-${canPlay ? '1' : '0'}-${isFirstInSequence ? '1' : '0'}`
      };
      
      console.log(`📚 Lesson "${lesson.title}":`, {
        isCompleted: isCompleted ? '🏆' : '❌',
        isLocked: isLocked ? '🔒' : '🔓',
        canPlay: canPlay ? '✅' : '❌',
        isFirstInSequence,
        isCurrent: isCurrent ? '🎵' : '⏸️'
      });
      
      lessonStatusMap.set(lesson.id, status);
    });
    
    return lessonStatusMap;
  }, [
    // OPTIMIZADO: Dependencias más específicas
    lessons.map(l => `${l.id}:${l.isCompleted ? '1' : '0'}:${l.isLocked ? '1' : '0'}`).join('|'),
    modules.map(m => `${m.id}:${m.lessonIds.join(',')}`).join('|'),
    currentLessonId
  ]);
}
