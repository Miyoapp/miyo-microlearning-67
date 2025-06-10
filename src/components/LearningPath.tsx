
import { useMemo } from 'react';
import { Lesson, Module } from '../types';
import { Play, Lock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { getOrderedLessons, isFirstLessonInSequence } from '@/hooks/consolidated-lessons/lessonOrderUtils';

interface LearningPathProps {
  lessons: Lesson[];
  modules: Module[];
  onSelectLesson: (lesson: Lesson) => void;
  currentLessonId: string | null;
}

const LearningPath = React.memo(({ lessons, modules, onSelectLesson, currentLessonId }: LearningPathProps) => {
  // CORREGIDO: Usar orden real basado en la BD
  const orderedLessons = useMemo(() => {
    return getOrderedLessons(lessons, modules);
  }, [lessons, modules]);

  // Agrupar lecciones por módulo manteniendo el orden real
  const getLessonsForModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return [];
    
    // Obtener lecciones en el orden definido por lessonIds del módulo
    return module.lessonIds
      .map(id => lessons.find(lesson => lesson.id === id))
      .filter((lesson): lesson is Lesson => lesson !== undefined);
  };

  // OPTIMIZADO: Memoizar cálculos de estado de lecciones usando orden real
  const lessonStatusMap = useMemo(() => {
    const statusMap = new Map();
    
    lessons.forEach(lesson => {
      const isCompleted = lesson.isCompleted;
      const isLocked = lesson.isLocked;
      const isCurrent = currentLessonId === lesson.id;
      
      // CRÍTICO: Verificar si es la primera lección usando orden real
      const isFirstInSequence = isFirstLessonInSequence(lesson, lessons, modules);
      const canPlay = isCompleted || !isLocked || isFirstInSequence;
      
      statusMap.set(lesson.id, {
        isCompleted,
        isLocked,
        isCurrent,
        canPlay,
        isFirstInSequence
      });
      
      console.log(`🔍 Lesson status for ${lesson.title}:`, {
        isCompleted,
        isLocked,
        isCurrent,
        canPlay,
        isFirstInSequence
      });
    });
    
    return statusMap;
  }, [lessons, modules, currentLessonId]);

  // OPTIMIZADO: Memoizar clases CSS
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
  }, [lessons, lessonStatusMap]);
  
  return (
    <div className="py-3">
      <h2 className="text-2xl font-bold mb-2 text-center">Tu Ruta de Aprendizaje</h2>
      
      <div className="relative max-w-[400px] mx-auto">
        {modules.map((module, moduleIndex) => {
          const moduleLessons = getLessonsForModule(module.id);
          
          if (moduleLessons.length === 0) return null;
          
          return (
            <div key={module.id} className="mb-6">
              {/* Título del módulo */}
              <div className="text-center mb-3 px-2">
                <h3 className="text-sm font-medium text-indigo-700 bg-indigo-50 inline-block py-1 px-3 rounded-full">
                  {module.title}
                </h3>
              </div>
              
              {/* Lecciones dentro de este módulo */}
              <div className="space-y-[25px]">
                {moduleLessons.map((lesson, index) => {
                  const status = lessonStatusMap.get(lesson.id);
                  if (!status) return null;
                  
                  const { isCompleted, isLocked, isCurrent, canPlay, isFirstInSequence } = status;
                  const classes = getLessonClasses.get(lesson.id);
                  if (!classes) return null;
                  
                  const { nodeClasses, textClasses } = classes;
                  
                  // Efecto zigzag alternando posiciones
                  const containerAlignment = index % 2 === 0 
                    ? "justify-start" 
                    : "justify-start ml-[45px]";
                  
                  const handleClick = () => {
                    if (canPlay) {
                      console.log('🎯 User clicked lesson:', lesson.title, 'canPlay:', canPlay, 'isCompleted:', isCompleted, 'isLocked:', isLocked, 'isFirst:', isFirstInSequence);
                      onSelectLesson(lesson);
                    } else {
                      console.log('🚫 Lesson not playable:', lesson.title, 'isLocked:', isLocked, 'isFirst:', isFirstInSequence);
                    }
                  };
                  
                  return (
                    <div key={lesson.id} className={`flex ${containerAlignment} items-center`}>
                      <div 
                        className={nodeClasses}
                        onClick={handleClick}
                      >
                        {/* CORREGIDO: Lógica de iconos basada en estado real */}
                        {isCompleted ? (
                          <Trophy size={16} />
                        ) : canPlay ? (
                          <Play size={16} fill="white" />
                        ) : (
                          <Lock size={16} />
                        )}
                      </div>
                      
                      {/* Indicador de progreso para lección actual */}
                      {isCurrent && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                      
                      {/* Título de la lección */}
                      <div 
                        className={cn("ml-3", { "cursor-pointer": canPlay, "cursor-not-allowed": !canPlay })}
                        onClick={handleClick}
                      >
                        <div className={textClasses}>
                          {lesson.title}
                          {isCurrent && (
                            <span className="ml-2 text-xs text-green-600">● Reproduciendo</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

LearningPath.displayName = 'LearningPath';

export default LearningPath;
