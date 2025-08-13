
import { useMemo } from 'react';
import { Lesson } from '@/types';
import { cn } from '@/lib/utils';

export function useLessonClasses(lessons: Lesson[], lessonStatusMap: Map<string, any>) {
  const getLessonClasses = useMemo(() => {
    const classCache = new Map();
    
    // Hash para optimización
    const statusMapHash = Array.from(lessonStatusMap.entries())
      .map(([id, status]) => `${id}:${status._hash || 'no-hash'}`)
      .join('|');
    
    lessons.forEach(lesson => {
      const status = lessonStatusMap.get(lesson.id);
      if (!status) return;
      
      const { isCompleted, isLocked, isCurrent, canPlay } = status;
      
      // CORREGIDO: Todas las lecciones reproducibles tienen el mismo estilo (play morado)
      // No diferenciamos visualmente entre completadas y no completadas
      const nodeClasses = cn(
        "flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all duration-200 relative",
        {
          // TODAS las lecciones reproducibles: Play morado (▶️) - incluye completadas
          "bg-[#5e16ea] text-white hover:bg-[#4a11ba]": canPlay,
          // Lecciones bloqueadas: Candado gris (🔒)
          "bg-gray-300 text-gray-500": !canPlay && isLocked,
          "hover:scale-110": canPlay,
          // Ring colors para lecciones activas - siempre morado
          "ring-2 ring-[#5e16ea]": isCurrent && canPlay,
          "cursor-pointer": canPlay,
          "cursor-not-allowed": !canPlay
        }
      );

      const textClasses = cn(
        "text-sm transition-colors duration-200",
        {
          // TODAS las lecciones reproducibles tienen texto morado cuando son actuales
          "text-[#5e16ea] font-semibold": isCurrent && canPlay,
          // Texto para lecciones disponibles (incluyendo completadas)
          "text-gray-800": canPlay && !isCurrent,
          // Texto para lecciones bloqueadas
          "text-gray-400": !canPlay && isLocked
        }
      );

      classCache.set(lesson.id, { nodeClasses, textClasses });
    });
    
    console.log('🎨 useLessonClasses: Recalculated with statusMapHash:', statusMapHash.slice(0, 50));
    return classCache;
  }, [
    // OPTIMIZADO: Dependencies estables
    lessons.map(l => l.id).join('|'),
    Array.from(lessonStatusMap.entries()).map(([id, status]) => `${id}:${status._hash || 'no-hash'}`).join('|')
  ]);

  return getLessonClasses;
}
