
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
  
  // Group lessons by sections (assuming every 3 lessons form a section)
  const sectionSize = 3;
  const sections = lessons.reduce((acc, lesson, index) => {
    const sectionIndex = Math.floor(index / sectionSize);
    if (!acc[sectionIndex]) {
      acc[sectionIndex] = [];
    }
    acc[sectionIndex].push(lesson);
    return acc;
  }, [] as Lesson[][]);
  
  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Tu Ruta de Aprendizaje</h2>
      
      <div className="relative max-w-2xl mx-auto">
        {/* Sections with headers */}
        {sections.map((sectionLessons, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            {/* Section header */}
            <div className="flex items-center justify-center mb-3">
              <div className="h-px bg-gray-200 flex-grow"></div>
              <h3 className="text-gray-500 px-4 text-sm font-medium">
                {sectionIndex === 0 ? "Introducción al sistema financiero" : "Productos y servicios financieros esenciales"}
              </h3>
              <div className="h-px bg-gray-200 flex-grow"></div>
            </div>
            
            {/* Lessons in zigzag pattern within section */}
            <div className="space-y-3">
              {sectionLessons.map((lesson, index) => {
                const isCompleted = lesson.isCompleted;
                const isAvailable = !lesson.isLocked;
                const isCurrent = currentLessonId === lesson.id;
                const isHovered = hoveredLesson === lesson.id;
                
                // Determine node styles based on lesson state
                let nodeClasses = cn(
                  "flex items-center justify-center w-12 h-12 rounded-full shadow-sm transition-all duration-300",
                  {
                    "bg-purple-600 text-white": isCompleted,
                    "bg-purple-600 text-white": isCurrent && !isCompleted,
                    "bg-purple-600 text-white": isAvailable && !isCurrent && !isCompleted,
                    "bg-gray-300 text-gray-500": !isAvailable,
                    "scale-110": isHovered && isAvailable,
                    "animate-pulse": isCurrent
                  }
                );
                
                // Zigzag pattern - even indices go left, odd go right
                const lessonGlobalIndex = sectionIndex * sectionSize + index;
                const containerAlignment = lessonGlobalIndex % 2 === 0 
                  ? "justify-start pl-12" 
                  : "justify-end pr-12";
                
                return (
                  <div key={lesson.id} className={`flex ${containerAlignment} items-center`}>
                    <div 
                      className={`relative ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'} flex items-center ${lessonGlobalIndex % 2 === 0 ? '' : 'flex-row-reverse'}`}
                      onClick={() => isAvailable && onSelectLesson(lesson)}
                      onMouseEnter={() => setHoveredLesson(lesson.id)}
                      onMouseLeave={() => setHoveredLesson(null)}
                    >
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
                      
                      {/* Lesson title */}
                      <div className={`mx-3 text-sm`}>
                        {lesson.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPath;
