
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
  // Group lessons by module
  const getLessonsForModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return [];
    
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
                  
                  // Determine node styles based on lesson state
                  let nodeClasses = cn(
                    "flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all duration-300 relative",
                    {
                      "bg-yellow-500 text-white": isCompleted, // Trofeo dorado/amarillo
                      "bg-miyo-800 text-white": isCurrent && !isCompleted,
                      "bg-miyo-600 text-white": isAvailable && !isCurrent && !isCompleted,
                      "bg-gray-300 text-gray-500": !isAvailable,
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
                          ) : isCurrent ? (
                            <Play size={16} fill="white" />
                          ) : isAvailable ? (
                            <Play size={16} fill="white" />
                          ) : (
                            <Lock size={16} />
                          )}
                        </div>
                      </div>
                      
                      {/* Lesson title */}
                      <div className="ml-3">
                        <div className={cn(
                          "text-sm transition-colors", 
                          {
                            "text-yellow-600": isCompleted, // Color de texto para lecciones completadas
                            "text-miyo-800 font-semibold": isCurrent,
                            "text-gray-800": isAvailable && !isCurrent && !isCompleted,
                            "text-gray-400": !isAvailable
                          }
                        )}>
                          {lesson.title}
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
