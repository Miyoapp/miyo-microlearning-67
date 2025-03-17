
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
    <div className="py-4">
      <h2 className="text-2xl font-bold mb-3 text-center">Tu Ruta de Aprendizaje</h2>
      
      <div className="relative max-w-xs mx-auto">
        {/* Ultra-compressed cascading path with minimal spacing */}
        <div className="space-y-1">
          {lessons.map((lesson, index) => {
            const isCompleted = lesson.isCompleted;
            const isAvailable = !lesson.isLocked;
            const isCurrent = currentLessonId === lesson.id;
            const isHovered = hoveredLesson === lesson.id;
            
            // Determine node styles based on lesson state
            let nodeClasses = cn(
              "flex items-center justify-center w-10 h-10 rounded-full shadow-md transition-all duration-300",
              {
                "bg-green-500 text-white": isCompleted,
                "bg-miyo-800 text-white": isCurrent && !isCompleted,
                "bg-miyo-600 text-white": isAvailable && !isCurrent && !isCompleted,
                "bg-gray-300 text-gray-500": !isAvailable,
                "scale-110": isHovered && isAvailable,
                "animate-pulse": isCurrent
              }
            );
            
            // Further reduced horizontal separation - right circles almost aligned with center
            const containerAlignment = index % 2 === 0 ? "justify-start pl-2" : "justify-end pr-0.5";
            
            return (
              <div key={lesson.id} className={`flex ${containerAlignment}`}>
                <div 
                  className={`relative ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  onClick={() => isAvailable && onSelectLesson(lesson)}
                  onMouseEnter={() => setHoveredLesson(lesson.id)}
                  onMouseLeave={() => setHoveredLesson(null)}
                >
                  {/* Connect to next lesson with shorter lines */}
                  {index < lessons.length - 1 && (
                    <div 
                      className={`absolute ${index % 2 === 0 ? 'left-1/2 -translate-x-1/2 rotate-10' : 'left-1/2 -translate-x-1/2 -rotate-10'} h-4 border-r-2 border-dashed border-gray-200 top-full`}
                      style={{ width: '2px', transform: `rotate(${index % 2 === 0 ? '10deg' : '-10deg'})` }}
                    />
                  )}
                  
                  {/* Lesson circle - slightly smaller */}
                  <div className={nodeClasses}>
                    {isCompleted ? (
                      <Trophy size={18} />
                    ) : isCurrent ? (
                      <Play size={18} fill="white" />
                    ) : isAvailable ? (
                      <Play size={18} fill="white" />
                    ) : (
                      <Lock size={18} />
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
