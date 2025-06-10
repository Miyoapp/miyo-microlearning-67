
import { useState } from 'react';
import { Lesson, Module } from '../types';
import { Play, Lock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningPathProps {
  lessons: Lesson[];
  modules: Module[];
  onSelectLesson: (lesson: Lesson) => void;
  currentLessonId: string | null;
}

const LearningPath = ({ lessons, modules, onSelectLesson, currentLessonId }: LearningPathProps) => {
  // Group lessons by module and ensure they are in the correct order
  const getLessonsForModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return [];
    
    // Get lessons in the order defined by lessonIds array
    return module.lessonIds
      .map(id => lessons.find(lesson => lesson.id === id))
      .filter((lesson): lesson is Lesson => lesson !== undefined);
  };
  
  return (
    <div className="py-3">
      <h2 className="text-2xl font-bold mb-2 text-center">Tu Ruta de Aprendizaje</h2>
      
      <div className="relative max-w-[400px] mx-auto">
        {modules.map((module, moduleIndex) => {
          const moduleLessons = getLessonsForModule(module.id);
          
          if (moduleLessons.length === 0) return null;
          
          return (
            <div key={module.id} className="mb-6">
              {/* Module title with subtle styling */}
              <div className="text-center mb-3 px-2">
                <h3 className="text-sm font-medium text-indigo-700 bg-indigo-50 inline-block py-1 px-3 rounded-full">
                  {module.title}
                </h3>
              </div>
              
              {/* Lessons within this module */}
              <div className="space-y-[25px]">
                {moduleLessons.map((lesson, index) => {
                  const isCompleted = lesson.isCompleted;
                  const isAvailable = !lesson.isLocked;
                  const isCurrent = currentLessonId === lesson.id;
                  
                  let nodeClasses = cn(
                    "flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all duration-300 relative",
                    {
                      "bg-yellow-500 text-white": isCompleted, // Trofeo dorado/amarillo
                      "bg-[#5e16ea] text-white": !isCompleted && (isCurrent || isAvailable), // Color morado específico
                      "bg-gray-300 text-gray-500": !isAvailable, // Lecciones bloqueadas en gris
                      "hover:scale-110": isAvailable, // Efecto hover solo para lecciones disponibles
                      "ring-2 ring-yellow-300": isCurrent && isCompleted, // Ring for current completed lesson
                      "ring-2 ring-[#5e16ea]": isCurrent && !isCompleted // Ring for current incomplete lesson
                    }
                  );
                  
                  // Alternate positions to create zigzag effect 
                  const containerAlignment = index % 2 === 0 
                    ? "justify-start" 
                    : "justify-start ml-[45px]";
                  
                  return (
                    <div key={lesson.id} className={`flex ${containerAlignment} items-center`}>
                      <div 
                        className={`relative ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        onClick={() => isAvailable && onSelectLesson(lesson)}
                      >
                        {/* Lesson circle with icon */}
                        <div className={nodeClasses}>
                          {isCompleted ? (
                            <Trophy size={16} />
                          ) : isAvailable ? (
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
                      </div>
                      
                      {/* Lesson title */}
                      <div 
                        className={cn(
                          "ml-3 cursor-pointer", 
                          { "cursor-not-allowed": !isAvailable }
                        )}
                        onClick={() => isAvailable && onSelectLesson(lesson)}
                      >
                        <div className={cn(
                          "text-sm transition-colors", 
                          {
                            "text-yellow-600 font-semibold": isCompleted, // Color de texto para lecciones completadas
                            "text-[#5e16ea] font-semibold": isCurrent && !isCompleted, // Color morado específico
                            "text-gray-800": isAvailable && !isCurrent && !isCompleted,
                            "text-gray-400": !isAvailable
                          }
                        )}>
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
};

export default LearningPath;
