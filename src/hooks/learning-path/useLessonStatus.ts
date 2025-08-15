
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
      // NUEVA LÓGICA: Más robusta para prevenir bloqueos visuales
      const canPlay = isCompleted || !isLocked || isFirstInSequence || isCurrent;
      
      // REFORZADO: Lecciones completadas NUNCA pueden estar bloqueadas visualmente
      const visuallyLocked = isCompleted ? false : (isLocked && !isCurrent && !isFirstInSequence);
      
      const status = {
        isCompleted,
        // CRÍTICO: Usar visuallyLocked en lugar de cálculo directo
        isLocked: visuallyLocked,
        isCurrent,
        canPlay,
        isFirstInSequence,
        // Hash mejorado para debugging
        _hash: `completed:${isCompleted ? '1' : '0'}-locked:${visuallyLocked ? '1' : '0'}-current:${isCurrent ? '1' : '0'}-canPlay:${canPlay ? '1' : '0'}-first:${isFirstInSequence ? '1' : '0'}`
      };
      
      // Logs detallados para debugging
      if (isCompleted) {
        console.log(`🏆 COMPLETED LESSON "${lesson.title}":`, {
          isCompleted: '✅ SÍ',
          visuallyLocked: visuallyLocked ? '🔒 BLOQUEADA (ERROR!)' : '🔓 DESBLOQUEADA (CORRECTO)',
          canPlay: canPlay ? '▶️ REPRODUCIBLE (CORRECTO)' : '❌ NO REPRODUCIBLE (ERROR!)',
          isCurrent: isCurrent ? '🎵 ACTUAL' : '⏸️ NO ACTUAL',
          shouldMaintainPlayIcon: 'SÍ - SIN CAMBIO VISUAL'
        });
        
        // ALERTA si una lección completada está bloqueada
        if (visuallyLocked) {
          console.error('🚨🚨🚨 ERROR: Completed lesson is visually locked!', lesson.title);
        }
      } else {
        console.log(`📚 NON-COMPLETED LESSON "${lesson.title}":`, {
          isCompleted: '❌ NO',
          visuallyLocked: visuallyLocked ? '🔒 BLOQUEADA' : '🔓 DESBLOQUEADA',
          canPlay: canPlay ? '▶️ REPRODUCIBLE' : '🔒 BLOQUEADA',
          isCurrent: isCurrent ? '🎵 ACTUAL' : '⏸️ NO ACTUAL'
        });
      }
      
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
