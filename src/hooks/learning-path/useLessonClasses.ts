
import { useMemo } from 'react';
import { Lesson } from '@/types';
import { cn } from '@/lib/utils';

export function useLessonClasses(lessons: Lesson[], lessonStatusMap: Map<string, any>) {
  const getLessonClasses = useMemo(() => {
    const classCache = new Map();
    
    const statusMapHash = Array.from(lessonStatusMap.entries())
      .map(([id, status]) => `${id}:${status._hash || 'no-hash'}`)
      .join('|');
    
    lessons.forEach(lesson => {
      const status = lessonStatusMap.get(lesson.id);
      if (!status) return;
      
      const { isCompleted, isLocked, isCurrent, canPlay } = status;
      
      // Card background classes with subtle colors
      const cardBackgroundClasses = cn(
        "rounded-lg border transition-all duration-300 p-4",
        {
          "bg-yellow-50 border-yellow-200 hover:bg-yellow-100": isCompleted,
          "bg-white border-gray-300 hover:border-gray-400 hover:shadow-sm": canPlay && !isCompleted,
          "bg-gray-50 border-gray-200": isLocked && !canPlay,
          "ring-1 ring-[#5e16ea]/20": isCurrent
        }
      );
      
      // Icon classes (now smaller for the card layout)
      const nodeClasses = cn(
        "flex items-center justify-center w-8 h-8 rounded-full shadow-sm transition-all duration-200",
        {
          "bg-yellow-500 text-white": isCompleted,
          "bg-[#5e16ea] text-white": !isCompleted && canPlay,
          "bg-gray-300 text-gray-500": isLocked && !isCompleted && !canPlay,
          "hover:scale-105": canPlay,
          "cursor-pointer": canPlay,
          "cursor-not-allowed": !canPlay
        }
      );

      const textClasses = cn(
        "text-sm font-medium transition-colors duration-200",
        {
          "text-yellow-700": isCompleted,
          "text-[#5e16ea]": isCurrent && !isCompleted && canPlay,
          "text-gray-800": canPlay && !isCurrent && !isCompleted,
          "text-gray-400": !canPlay
        }
      );

      classCache.set(lesson.id, { 
        cardBackgroundClasses,
        nodeClasses, 
        textClasses 
      });
    });
    
    console.log('🎨 useLessonClasses: Recalculated with card backgrounds');
    return classCache;
  }, [
    lessons.map(l => l.id).join('|'),
    Array.from(lessonStatusMap.entries()).map(([id, status]) => `${id}:${status._hash || 'no-hash'}`).join('|')
  ]);

  return getLessonClasses;
}
