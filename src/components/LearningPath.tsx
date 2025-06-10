
import { useMemo } from 'react';
import { Lesson, Module } from '../types';
import { Play, Lock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface LearningPathProps {
  lessons: Lesson[];
  modules: Module[];
  onSelectLesson: (lesson: Lesson) => void;
  currentLessonId: string | null;
}

const LearningPath = React.memo(({ lessons, modules, onSelectLesson, currentLessonId }: LearningPathProps) => {
  // Group lessons by module and ensure they are in the correct order
  const getLessonsForModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return [];
    
    // Get lessons in the order defined by lessonIds array
    return module.lessonIds
      .map(id => lessons.find(lesson => lesson.id === id))
      .filter((lesson): lesson is Lesson => lesson !== undefined);
  };

  // OPTIMIZED: Memoize lesson status calculations
  const lessonStatusMap = useMemo(() => {
    const statusMap = new Map();
    lessons.forEach(lesson => {
      const isCompleted = lesson.isCompleted;
      const isLocked = lesson.isLocked;
      const isCurrent = currentLessonId === lesson.id;
      
      // CRITICAL FIX: First lesson is always playable
      const isFirstLesson = lessons.findIndex(l => l.id === lesson.id) === 0;
      const canPlay = isCompleted || !isLocked || isFirstLesson;
      
      statusMap.set(lesson.id, {
        isCompleted,
        isLocked,
        isCurrent,
        canPlay,
        isFirstLesson
      });
    });
    return statusMap;
  }, [lessons, currentLessonId]);

  // OPTIMIZED: Memoize CSS classes
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
              {/* Module title */}
              <div className="text-center mb-3 px-2">
                <h3 className="text-sm font-medium text-indigo-700 bg-indigo-50 inline-block py-1 px-3 rounded-full">
                  {module.title}
                </h3>
              </div>
              
              {/* Lessons within this module */}
              <div className="space-y-[25px]">
                {moduleLessons.map((lesson, index) => {
                  const status = lessonStatusMap.get(lesson.id);
                  if (!status) return null;
                  
                  const { isCompleted, isLocked, isCurrent, canPlay, isFirstLesson } = status;
                  const classes = getLessonClasses.get(lesson.id);
                  if (!classes) return null;
                  
                  const { nodeClasses, textClasses } = classes;
                  
                  // Alternate positions for zigzag effect 
                  const containerAlignment = index % 2 === 0 
                    ? "justify-start" 
                    : "justify-start ml-[45px]";
                  
                  const handleClick = () => {
                    if (canPlay) {
                      console.log('🎯 User clicked lesson:', lesson.title, 'canPlay:', canPlay, 'isCompleted:', isCompleted, 'isLocked:', isLocked, 'isFirst:', isFirstLesson);
                      onSelectLesson(lesson);
                    } else {
                      console.log('🚫 Lesson not playable:', lesson.title, 'isLocked:', isLocked);
                    }
                  };
                  
                  return (
                    <div key={lesson.id} className={`flex ${containerAlignment} items-center`}>
                      <div 
                        className={nodeClasses}
                        onClick={handleClick}
                      >
                        {/* Icon logic */}
                        {isCompleted ? (
                          <Trophy size={16} />
                        ) : canPlay ? (
                          <Play size={16} fill="white" />
                        ) : (
                          <Lock size={16} />
                        )}
                      </div>
                      
                      {/* Progress indicator for current lesson */}
                      {isCurrent && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                      
                      {/* Lesson title */}
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
