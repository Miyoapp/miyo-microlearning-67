
import { useMemo } from 'react';
import { Lesson } from '@/types';
import { cn } from '@/lib/utils';

export function useLessonClasses(lessons: Lesson[], lessonStatusMap: Map<string, any>) {
  // OPTIMIZADO: Memoización más estable con hash específico
  const getLessonClasses = useMemo(() => {
    const classCache = new Map();
    
    // OPTIMIZACIÓN: Crear hash para status map
    const statusMapHash = Array.from(lessonStatusMap.entries())
      .map(([id, status]) => `${id}:${status._hash || 'no-hash'}`)
      .join('|');
    
    lessons.forEach(lesson => {
      const status = lessonStatusMap.get(lesson.id);
      if (!status) return;
      
      const { isCompleted, isLocked, isCurrent, canPlay } = status;
      
      const nodeClasses = cn(
        "flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all duration-200 relative",
        {
          // UPDATED: Use purple for completed lessons instead of yellow
          "bg-[#5e16ea] text-white hover:bg-[#4a11ba]": (isCompleted) || (!isCompleted && canPlay),
          "bg-gray-300 text-gray-500": isLocked && !isCompleted && !canPlay,
          "hover:scale-110": canPlay,
          // UPDATED: Use purple ring for completed lessons
          "ring-2 ring-[#5e16ea]": (isCurrent && isCompleted) || (isCurrent && !isCompleted && canPlay),
          "cursor-pointer": canPlay,
          "cursor-not-allowed": !canPlay
        }
      );

      const textClasses = cn(
        "text-sm transition-colors duration-200",
        {
          // UPDATED: Use purple for completed lessons instead of yellow
          "text-[#5e16ea] font-semibold": (isCompleted) || (isCurrent && !isCompleted && canPlay),
          "text-gray-800": canPlay && !isCurrent && !isCompleted,
          "text-gray-400": !canPlay
        }
      );

      classCache.set(lesson.id, { nodeClasses, textClasses });
    });
    
    console.log('🎨 useLessonClasses: Recalculated with statusMapHash:', statusMapHash.slice(0, 50));
    return classCache;
  }, [
    // ESTABILIZADO: Dependencies más específicas
    lessons.map(l => l.id).join('|'),
    Array.from(lessonStatusMap.entries()).map(([id, status]) => `${id}:${status._hash || 'no-hash'}`).join('|')
  ]);

  return getLessonClasses;
}
