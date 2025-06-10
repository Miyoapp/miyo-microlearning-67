
import { useMemo } from 'react';
import { Lesson } from '@/types';
import { cn } from '@/lib/utils';

export function useLessonClasses(lessons: Lesson[], lessonStatusMap: Map<string, any>) {
  // OPTIMIZADO: Memoizar clases CSS (ESTABLE)
  const getLessonClasses = useMemo(() => {
    const classCache = new Map();
    
    lessons.forEach(lesson => {
      const status = lessonStatusMap.get(lesson.id);
      if (!status) return;
      
      const { isCompleted, isLocked, isCurrent, canPlay } = status;
      
      const nodeClasses = cn(
        "flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all duration-200 relative",
        {
          "bg-yellow-500 text-white hover:bg-yellow-600": isCompleted,
          "bg-[#5e16ea] text-white hover:bg-[#4a11ba]": !isCompleted && canPlay,
          "bg-gray-300 text-gray-500": isLocked && !isCompleted && !canPlay,
          "hover:scale-110": canPlay,
          "ring-2 ring-yellow-300": isCurrent && isCompleted,
          "ring-2 ring-[#5e16ea]": isCurrent && !isCompleted && canPlay,
          "cursor-pointer": canPlay,
          "cursor-not-allowed": !canPlay
        }
      );

      const textClasses = cn(
        "text-sm transition-colors duration-200",
        {
          "text-yellow-600 font-semibold": isCompleted,
          "text-[#5e16ea] font-semibold": isCurrent && !isCompleted && canPlay,
          "text-gray-800": canPlay && !isCurrent && !isCompleted,
          "text-gray-400": !canPlay
        }
      );

      classCache.set(lesson.id, { nodeClasses, textClasses });
    });
    
    return classCache;
  }, [lessons, lessonStatusMap]); // ESTABILIZADO: Solo dependencias necesarias

  return getLessonClasses;
}
