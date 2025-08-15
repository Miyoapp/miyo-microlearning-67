
import React from 'react';
import { Lesson } from '@/types';
import { Play, Pause, Lock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLessonCard } from '@/hooks/learning-path/useLessonCard';

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  status: {
    isCompleted: boolean;
    isLocked: boolean;
    isCurrent: boolean;
    canPlay: boolean;
    isFirstInSequence: boolean;
  };
  isGloballyPlaying: boolean;
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
}

const LessonCard = React.memo(({ lesson, index, status, isGloballyPlaying, onLessonClick }: LessonCardProps) => {
  const { isCompleted, isLocked, isCurrent, canPlay } = status;
  
  console.log('🎯🎯🎯 LessonCard render:', {
    lessonTitle: lesson.title,
    isCurrent,
    isGloballyPlaying,
    canPlay,
    isCompleted,
    timestamp: new Date().toLocaleTimeString()
  });
  
  const {
    isPlaying,
    duration,
    handlePlayPause,
    formatTime
  } = useLessonCard({
    lesson,
    canPlay,
    isCurrent,
    isGloballyPlaying,
    onLessonClick
  });

  // Determine which icon to show in the status button
  const getStatusIcon = () => {
    if (isCompleted) {
      return <Trophy size={16} />;
    }
    if (!canPlay) {
      return <Lock size={16} />;
    }
    // For playable lessons, show play/pause based on current state
    if (isCurrent && isPlaying) {
      return <Pause size={16} />;
    }
    return <Play size={16} fill="white" />;
  };

  return (
    <div className={cn(
      "bg-white rounded-lg border shadow-sm p-4 transition-all duration-200",
      {
        "border-yellow-300 shadow-md": isCompleted,
        "border-[#5e16ea] shadow-md": isCurrent && !isCompleted,
        "border-gray-200": !isCurrent && !isCompleted && canPlay,
        "border-gray-100 bg-gray-50": !canPlay,
        "hover:shadow-md": canPlay,
        "cursor-not-allowed": !canPlay
      }
    )}>
      {/* Header with title and status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Functional Status/Play Button */}
          <button
            onClick={handlePlayPause}
            disabled={!canPlay}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
              {
                "bg-yellow-500 text-white hover:bg-yellow-600": isCompleted,
                "bg-[#5e16ea] text-white hover:bg-[#4a11ba]": !isCompleted && canPlay,
                "bg-gray-300 text-gray-500 cursor-not-allowed": !canPlay,
                "hover:scale-105": canPlay
              }
            )}
            aria-label={
              isCompleted 
                ? "Reproducir lección completada" 
                : !canPlay 
                  ? "Lección bloqueada" 
                  : isPlaying 
                    ? "Pausar" 
                    : "Reproducir"
            }
          >
            {getStatusIcon()}
          </button>
          
          {/* Title */}
          <div>
            <h4 className={cn(
              "font-medium text-sm",
              {
                "text-yellow-600": isCompleted,
                "text-[#5e16ea]": isCurrent && !isCompleted,
                "text-gray-900": canPlay && !isCurrent && !isCompleted,
                "text-gray-400": !canPlay
              }
            )}>
              {lesson.title}
            </h4>
            {isCurrent && (
              <span className="text-xs text-green-600">
                {isPlaying ? "● Reproduciendo" : "● Seleccionada"}
              </span>
            )}
          </div>
        </div>

        {/* Duration - Show total duration */}
        <div className={cn(
          "text-xs",
          {
            "text-yellow-600": isCompleted,
            "text-[#5e16ea]": isCurrent && !isCompleted,
            "text-gray-600": canPlay && !isCurrent && !isCompleted,
            "text-gray-400": !canPlay
          }
        )}>
          {formatTime(duration)}
        </div>
      </div>

      {/* Simplified status message */}
      {!canPlay && (
        <div className="text-center py-2">
          <p className="text-xs text-gray-400">
            Completa las lecciones anteriores para desbloquear
          </p>
        </div>
      )}
      
      {/* Current lesson indicator */}
      {isCurrent && canPlay && (
        <div className="text-center py-2">
          <p className="text-xs text-[#5e16ea]">
            {isPlaying ? "🎵 Usa el reproductor de abajo para controlar la reproducción" : "⏸️ Lección seleccionada"}
          </p>
        </div>
      )}
    </div>
  );
});

LessonCard.displayName = 'LessonCard';

export default LessonCard;
