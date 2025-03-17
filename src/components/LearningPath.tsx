
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
    <div className="py-3">
      <h2 className="text-2xl font-bold mb-2 text-center">Tu Ruta de Aprendizaje</h2>
      
      <div className="relative max-w-[180px] mx-auto">
        {/* Ultra-compressed vertical path with minimal zigzag */}
        <div className="space-y-[25px]">
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
            
            // Increase offset for right-side icons to create more distance
            const containerAlignment = index % 2 === 0 
              ? "justify-start" 
              : "justify-start ml-[45px]";
            
            return (
              <div key={lesson.id} className={`flex ${containerAlignment}`}>
                <div 
                  className={`relative ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  onClick={() => isAvailable && onSelectLesson(lesson)}
                  onMouseEnter={() => setHoveredLesson(lesson.id)}
                  onMouseLeave={() => setHoveredLesson(null)}
                >
                  {/* Removed connecting lines */}
                  
                  {/* Lesson circle - larger */}
                  <div className={nodeClasses}>
                    {isCompleted ? (
                      <Trophy size={24} />
                    ) : isCurrent ? (
                      <Play size={24} fill="white" />
                    ) : isAvailable ? (
                      <Play size={24} fill="white" />
                    ) : (
                      <Lock size={24} />
                    )}
                  </div>
                  
                  {/* Lesson title tooltip */}
                  <div className={`absolute z-10 mt-2 px-3 py-1 bg-white shadow-md rounded-md text-sm transition-opacity duration-200 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
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
