
import React from 'react';
import { Lesson } from '@/types';
import { Play, Lock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonItemProps {
  lesson: Lesson;
  index: number;
  status: {
    isCompleted: boolean;
    isLocked: boolean;
    isCurrent: boolean;
    canPlay: boolean;
    isFirstInSequence: boolean;
  };
  classes: {
    nodeClasses: string;
    textClasses: string;
  };
  onLessonClick: (lesson: Lesson) => void;
}

const LessonItem = React.memo(({ lesson, index, status, classes, onLessonClick }: LessonItemProps) => {
  const { isCompleted, isCurrent, canPlay } = status;
  const { nodeClasses, textClasses } = classes;
  
  // Efecto zigzag alternando posiciones
  const containerAlignment = index % 2 === 0 
    ? "justify-start" 
    : "justify-start ml-[45px]";
  
  return (
    <div className={`flex ${containerAlignment} items-center`}>
      <div 
        className={nodeClasses}
        onClick={() => onLessonClick(lesson)}
      >
        {/* CORREGIDO: Tamaño consistente de íconos (18px) */}
        {isCompleted ? (
          <Trophy size={18} />
        ) : canPlay ? (
          <Play size={18} fill="white" />
        ) : (
          <Lock size={18} />
        )}
      </div>
      
      {/* Indicador de progreso para lección actual */}
      {isCurrent && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      )}
      
      {/* Título de la lección con ancho fijo para evitar afectar íconos */}
      <div 
        className={cn("ml-3 flex-1 max-w-[280px]", { "cursor-pointer": canPlay, "cursor-not-allowed": !canPlay })}
        onClick={() => onLessonClick(lesson)}
      >
        <div className={cn(textClasses, "leading-snug")}>
          {lesson.title}
          {isCurrent && (
            <span className="ml-2 text-xs text-green-600">● Reproduciendo</span>
          )}
        </div>
      </div>
    </div>
  );
});

LessonItem.displayName = 'LessonItem';

export default LessonItem;
