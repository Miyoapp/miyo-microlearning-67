
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
      
      // CORREGIDO: Colores según especificación
      const nodeClasses = cn(
        "flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all duration-200 relative",
        {
          // Lecciones completadas: Trofeo amarillo (🏆)
          "bg-yellow-500 text-white hover:bg-yellow-600": isCompleted,
          // Lecciones desbloqueadas: Play morado (▶️) - INCLUYE lecciones actuales
          "bg-[#5e16ea] text-white hover:bg-[#4a11ba]": !isCompleted && canPlay,
          // Lecciones bloqueadas: Candado gris (🔒) - SOLO si realmente están bloqueadas
          "bg-gray-300 text-gray-500": isLocked && !canPlay,
          "hover:scale-110": canPlay,
          // Ring colors para lecciones activas
          "ring-2 ring-yellow-300": isCurrent && isCompleted,
          "ring-2 ring-[#5e16ea]": isCurrent && !isCompleted && canPlay,
          "cursor-pointer": canPlay,
          "cursor-not-allowed": !canPlay
        }
      );

      const textClasses = cn(
        "text-sm transition-colors duration-200",
        {
          // Texto para lecciones completadas
          "text-yellow-600 font-semibold": isCompleted,
          // Texto para lecciones actuales activas - DEBE ser morado si está desbloqueada
          "text-[#5e16ea] font-semibold": isCurrent && canPlay && !isCompleted,
          // Texto para lecciones disponibles
          "text-gray-800": canPlay && !isCurrent && !isCompleted,
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
