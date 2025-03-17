
import { useState } from 'react';
import { Lesson } from '../types';
import { Play, Lock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningPathProps {
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  currentLessonId: string | null;
}

const LearningPath = ({ lessons, onSelectLesson, currentLessonId }: LearningPathProps) => {
  const [hoveredLesson, setHoveredLesson] = useState<string | null>(null);
  
  if (!lessons.length) return null;
  
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Tu Ruta de Aprendizaje</h2>
      
      <div className="relative max-w-md mx-auto">
        {/* Compressed cascading path with minimal horizontal spacing */}
        <div className="space-y-2">
          {lessons.map((lesson, index) => {
            const isCompleted = lesson.isCompleted;
            const isAvailable = !lesson.isLocked;
            const isCurrent = currentLessonId === lesson.id;
            const isHovered = hoveredLesson === lesson.id;
            
            // Determine node styles based on lesson state
            let nodeClasses = cn(
              "flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all duration-300",
              {
                "bg-green-500 text-white": isCompleted,
                "bg-miyo-800 text-white": isCurrent && !isCompleted,
                "bg-miyo-600 text-white": isAvailable && !isCurrent && !isCompleted,
                "bg-gray-300 text-gray-500": !isAvailable,
                "scale-110": isHovered && isAvailable,
                "animate-pulse": isCurrent
              }
            );
            
            // Dramatically compressed horizontal spacing - small offset for zigzag effect
            const containerAlignment = index % 2 === 0 ? "justify-start pl-3" : "justify-end pr-3";
            
            return (
              <div key={lesson.id} className={`flex ${containerAlignment}`}>
                <div 
                  className={`relative ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  onClick={() => isAvailable && onSelectLesson(lesson)}
                  onMouseEnter={() => setHoveredLesson(lesson.id)}
                  onMouseLeave={() => setHoveredLesson(null)}
                >
                  {/* Connect to next lesson with steeper line for cascade effect */}
                  {index < lessons.length - 1 && (
                    <div 
                      className={`absolute ${index % 2 === 0 ? 'left-1/2 -translate-x-1/2 rotate-25' : 'left-1/2 -translate-x-1/2 -rotate-25'} h-6 border-r-2 border-dashed border-gray-200 top-full`}
                      style={{ width: '2px', transform: `rotate(${index % 2 === 0 ? '25deg' : '-25deg'})` }}
                    />
                  )}
                  
                  {/* Lesson circle */}
                  <div className={nodeClasses}>
                    {isCompleted ? (
                      <Trophy size={20} />
                    ) : isCurrent ? (
                      <Play size={20} fill="white" />
                    ) : isAvailable ? (
                      <Play size={20} fill="white" />
                    ) : (
                      <Lock size={20} />
                    )}
                  </div>
                  
                  {/* Lesson title tooltip */}
                  <div className={`absolute mt-2 px-3 py-1 bg-white shadow-md rounded-md text-sm transition-opacity duration-200 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="font-medium">{lesson.title}</div>
                    <div className="text-xs text-gray-500">{lesson.duration} min</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
