
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
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
}

const LessonItem = React.memo(({ lesson, index, status, classes, onLessonClick }: LessonItemProps) => {
  const { isCompleted, isCurrent, canPlay } = status;
  const { nodeClasses, textClasses } = classes;
  
  // CLICK HANDLER ESPECÍFICO PARA EL ÍCONO DE PLAY - CON AUTO-PLAY
  const handlePlayClick = () => {
    console.log('🔥🔥🔥 PLAY ICON CLICK - INICIO:', {
      lessonTitle: lesson.title,
      canPlay,
      isCompleted,
      timestamp: new Date().toLocaleTimeString()
    });
    
    if (canPlay) {
      // CRÍTICO: Pasar shouldAutoPlay=true para forzar reproducción inmediata
      onLessonClick(lesson, true);
      console.log('🔥🔥🔥 PLAY ICON CLICK - ENVIADO A onLessonClick con AUTO-PLAY:', lesson.title);
    } else {
      console.log('🚫🚫🚫 PLAY ICON CLICK - LECCIÓN BLOQUEADA:', lesson.title);
    }
  };
  
  // Efecto zigzag alternando posiciones
  const containerAlignment = index % 2 === 0 
    ? "justify-start" 
    : "justify-start ml-[45px]";
  
  return (
    <div className={`flex ${containerAlignment} items-center`}>
      <div 
        className={cn(nodeClasses, { "cursor-pointer": canPlay, "cursor-not-allowed": !canPlay })}
        onClick={handlePlayClick}
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
      
      {/* Título de la lección SIN onClick - solo visual */}
      <div className="ml-3 flex-1 max-w-[280px]">
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
