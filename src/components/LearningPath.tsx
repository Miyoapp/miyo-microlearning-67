
import { useState } from 'react';
import { Lesson } from '../types';
import { Play, Lock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface LearningPathProps {
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  currentLessonId: string | null;
}

const LearningPath = ({ lessons, onSelectLesson, currentLessonId }: LearningPathProps) => {
  const [hoveredLesson, setHoveredLesson] = useState<string | null>(null);
  
  if (!lessons.length) return null;
  
  // Define modules with their respective lessons
  const modules = [
    {
      name: "Fundamentos de Productividad",
      lessons: lessons.slice(0, 3)
    },
    {
      name: "Técnicas Avanzadas",
      lessons: lessons.slice(3)
    }
  ];
  
  return (
    <div className="py-3">
      <h2 className="text-2xl font-bold mb-2 text-center">Tu Ruta de Aprendizaje</h2>
      
      <div className="relative max-w-[280px] mx-auto">
        {modules.map((module, moduleIndex) => (
          <div key={moduleIndex} className="mb-6">
            {/* Module title */}
            <div className="text-center mb-3">
              <h3 className="text-lg font-semibold text-miyo-800 bg-miyo-100 inline-block px-3 py-1 rounded-full">
                {module.name}
              </h3>
            </div>
            
            {/* Lessons in this module */}
            <div className="space-y-[25px]">
              {module.lessons.map((lesson, index) => {
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
                
                // Calculate alignment based on module and position within module
                const containerAlignment = (moduleIndex * module.lessons.length + index) % 2 === 0 
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
            
            {/* Add separator between modules except for the last one */}
            {moduleIndex < modules.length - 1 && (
              <div className="my-4 px-6">
                <Separator className="bg-gray-200" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPath;
