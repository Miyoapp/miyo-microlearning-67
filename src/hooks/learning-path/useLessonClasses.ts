
import { useMemo } from 'react';
import { Lesson } from '@/types';
import { cn } from '@/lib/utils';

export function useLessonClasses(lessons: Lesson[], lessonStatusMap: Map<string, any>) {
  const getLessonClasses = useMemo(() => {
    const classCache = new Map();
    
    // Hash for optimization
    const statusMapHash = Array.from(lessonStatusMap.entries())
      .map(([id, status]) => `${id}:${status._hash || 'no-hash'}`)
      .join('|');
    
    lessons.forEach(lesson => {
      const status = lessonStatusMap.get(lesson.id);
      if (!status) return;
      
      const { isCompleted, isLocked, isCurrent, canPlay } = status;
      
      // FIXED: All playable lessons have the same purple play style
      // Completed lessons maintain play button appearance (no visual difference)
      const nodeClasses = cn(
        "flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all duration-200 relative",
        {
          // ALL playable lessons: Purple play button (▶️) - including completed ones
          "bg-[#5e16ea] text-white hover:bg-[#4a11ba]": canPlay,
          // Locked lessons: Gray lock (🔒)
          "bg-gray-300 text-gray-500": !canPlay && isLocked,
          "hover:scale-110": canPlay,
          // Ring colors for active lessons - always purple
          "ring-2 ring-[#5e16ea]": isCurrent && canPlay,
          "cursor-pointer": canPlay,
          "cursor-not-allowed": !canPlay
        }
      );

      const textClasses = cn(
        "text-sm transition-colors duration-200",
        {
          // ALL playable lessons have purple text when current
          "text-[#5e16ea] font-semibold": isCurrent && canPlay,
          // Text for available lessons (including completed)
          "text-gray-800": canPlay && !isCurrent,
          // Text for locked lessons
          "text-gray-400": !canPlay && isLocked
        }
      );

      classCache.set(lesson.id, { nodeClasses, textClasses });
    });
    
    console.log('🎨 useLessonClasses: Recalculated with statusMapHash:', statusMapHash.slice(0, 50));
    return classCache;
  }, [
    // OPTIMIZED: Stable dependencies
    lessons.map(l => l.id).join('|'),
    Array.from(lessonStatusMap.entries()).map(([id, status]) => `${id}:${status._hash || 'no-hash'}`).join('|')
  ]);

  return getLessonClasses;
}
