
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
      // - Lecciones completadas SIEMPRE reproducibles y NUNCA bloqueadas
      // - Lecciones desbloqueadas reproducibles  
      // - Primera lección siempre reproducible
      // - Lección actual SIEMPRE debe ser reproducible
      const canPlay = isCompleted || !isLocked || isFirstInSequence || isCurrent;
      
      const status = {
        isCompleted,
        // CRÍTICO: Las lecciones completadas NUNCA deben estar bloqueadas visualmente
        // Solo las lecciones no completadas pueden estar bloqueadas
        isLocked: isCompleted ? false : isLocked,
        isCurrent,
        canPlay,
        isFirstInSequence,
        // Hash mejorado para optimización
        _hash: `${isCompleted ? '1' : '0'}-${isCompleted ? '0' : (isLocked ? '1' : '0')}-${isCurrent ? '1' : '0'}-${canPlay ? '1' : '0'}-${isFirstInSequence ? '1' : '0'}`
      };
      
      console.log(`📚 Lesson "${lesson.title}":`, {
        isCompleted: isCompleted ? '🏆' : '❌',
        isLocked: status.isLocked ? '🔒' : '🔓',
        canPlay: canPlay ? '✅' : '❌',
        isFirstInSequence,
        isCurrent: isCurrent ? '🎵 ACTUAL' : '⏸️',
        rawLocked: isLocked,
        finalLocked: status.isLocked
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
