
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

// Definición de la interfaz para los módulos
interface Module {
  title: string;
  lessons: Lesson[];
}

const LearningPath = ({ lessons, onSelectLesson, currentLessonId }: LearningPathProps) => {
  const [hoveredLesson, setHoveredLesson] = useState<string | null>(null);
  
  if (!lessons.length) return null;
  
  // Organizar lecciones en módulos
  const modules: Module[] = [
    {
      title: "Fundamentos de Productividad",
      lessons: lessons.slice(0, 3), // Primeras 3 lecciones
    },
    {
      title: "Técnicas Avanzadas",
      lessons: lessons.slice(3), // Resto de lecciones
    }
  ];
  
  return (
    <div className="py-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Tu Ruta de Aprendizaje</h2>
      
      <div className="space-y-8">
        {modules.map((module, moduleIndex) => (
          <div key={moduleIndex} className="relative">
            {/* Título del módulo */}
            <div className="flex items-center mb-4">
              <Separator className="flex-grow" />
              <div className="px-4 text-center">
                <h3 className="text-lg font-medium text-gray-600 whitespace-normal">{module.title}</h3>
              </div>
              <Separator className="flex-grow" />
            </div>
            
            {/* Lecciones del módulo */}
            <div className="space-y-[40px]">
              {module.lessons.map((lesson, lessonIndex) => {
                const isCompleted = lesson.isCompleted;
                const isAvailable = !lesson.isLocked;
                const isCurrent = currentLessonId === lesson.id;
                const isHovered = hoveredLesson === lesson.id;
                
                // Determine node styles based on lesson state
                let nodeClasses = cn(
                  "flex items-center justify-center w-16 h-16 rounded-full shadow-md transition-all duration-300",
                  {
                    "bg-green-500 text-white": isCompleted,
                    "bg-miyo-800 text-white": isCurrent && !isCompleted,
                    "bg-miyo-600 text-white": isAvailable && !isCurrent && !isCompleted,
                    "bg-gray-300 text-gray-500": !isAvailable,
                    "scale-110": isHovered && isAvailable,
                    "animate-pulse": isCurrent
                  }
                );
                
                // Alternar posición para crear efecto zigzag
                const containerAlignment = lessonIndex % 2 === 0 
                  ? "justify-start" 
                  : "justify-end";
                
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
                          <Trophy size={28} />
                        ) : isCurrent ? (
                          <Play size={28} fill="white" />
                        ) : isAvailable ? (
                          <Play size={28} fill="white" />
                        ) : (
                          <Lock size={28} />
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
        ))}
      </div>
    </div>
  );
};

export default LearningPath;
