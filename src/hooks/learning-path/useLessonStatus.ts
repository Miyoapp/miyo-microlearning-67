
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
      
      // FIXED: Completed lessons are NEVER locked visually and ALWAYS playable
      // - Completed lessons (🎵) ALWAYS playable (for replay) and NEVER locked
      // - Unlocked lessons (▶️) playable  
      // - First lesson always playable
      // - CRITICAL: Current lesson ALWAYS must be playable
      const canPlay = isCompleted || !isLocked || isFirstInSequence || isCurrent;
      
      const status = {
        isCompleted,
        // CRITICAL: Completed lessons are NEVER locked visually
        isLocked: isCompleted ? false : (isLocked && !isCurrent),
        isCurrent,
        canPlay,
        isFirstInSequence,
        // Improved hash for optimization
        _hash: `${isCompleted ? '1' : '0'}-${isCompleted ? '0' : (isLocked && !isCurrent ? '1' : '0')}-${isCurrent ? '1' : '0'}-${canPlay ? '1' : '0'}-${isFirstInSequence ? '1' : '0'}`
      };
      
      console.log(`📚 Lesson "${lesson.title}":`, {
        isCompleted: isCompleted ? '🏆' : '❌',
        isLocked: status.isLocked ? '🔒' : '🔓',
        canPlay: canPlay ? '✅' : '❌',
        isFirstInSequence,
        isCurrent: isCurrent ? '🎵 ACTUAL' : '⏸️'
      });
      
      lessonStatusMap.set(lesson.id, status);
    });
    
    return lessonStatusMap;
  }, [
    // OPTIMIZED: More specific dependencies
    lessons.map(l => `${l.id}:${l.isCompleted ? '1' : '0'}:${l.isLocked ? '1' : '0'}`).join('|'),
    modules.map(m => `${m.id}:${m.lessonIds.join(',')}`).join('|'),
    currentLessonId
  ]);
}
