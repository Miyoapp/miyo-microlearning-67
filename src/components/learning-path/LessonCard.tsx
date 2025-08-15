
import React from 'react';
import { Lesson } from '@/types';
import { Play, Pause, Lock, Trophy, SkipBack, SkipForward, ChevronDown } from 'lucide-react';
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
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
}

const LessonCard = React.memo(({ lesson, index, status, onLessonClick }: LessonCardProps) => {
  const { isCompleted, isLocked, isCurrent, canPlay } = status;
  
  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    handlePlayPause,
    handleSeek,
    handleSkipBackward,
    handleSkipForward,
    handlePlaybackRateChange,
    formatTime
  } = useLessonCard({
    lesson,
    canPlay,
    isCurrent,
    onLessonClick
  });

  // Speed options for dropdown
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const [showSpeedDropdown, setShowSpeedDropdown] = React.useState(false);

  const validDuration = duration || (lesson.duracion * 60);
  const validCurrentTime = Math.min(currentTime, validDuration);

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
              <span className="text-xs text-green-600">● Reproduciendo</span>
            )}
          </div>
        </div>

        {/* Duration */}
        <div className={cn(
          "text-xs",
          {
            "text-yellow-600": isCompleted,
            "text-[#5e16ea]": isCurrent && !isCompleted,
            "text-gray-600": canPlay && !isCurrent && !isCompleted,
            "text-gray-400": !canPlay
          }
        )}>
          {formatTime(validCurrentTime)} / {formatTime(validDuration)}
        </div>
      </div>

      {/* Audio Controls - Only show if can play */}
      {canPlay && (
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="relative">
            <input
              type="range"
              min={0}
              max={validDuration}
              value={validCurrentTime}
              onChange={handleSeek}
              className="w-full accent-[#5e16ea] h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #5e16ea 0%, #5e16ea ${(validCurrentTime / validDuration) * 100}%, #e5e7eb ${(validCurrentTime / validDuration) * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>

          {/* Control Buttons - Only skip and speed controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Skip Backward */}
              <button
                onClick={handleSkipBackward}
                className="p-1 text-gray-600 hover:text-[#5e16ea] transition-colors"
                aria-label="Retroceder 15 segundos"
              >
                <SkipBack size={16} />
              </button>

              {/* Skip Forward */}
              <button
                onClick={handleSkipForward}
                className="p-1 text-gray-600 hover:text-[#5e16ea] transition-colors"
                aria-label="Avanzar 15 segundos"
              >
                <SkipForward size={16} />
              </button>
            </div>

            {/* Speed Control */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedDropdown(!showSpeedDropdown)}
                className="flex items-center text-gray-600 hover:text-[#5e16ea] transition-colors px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200"
              >
                <span>{playbackRate}x</span>
                <ChevronDown size={12} className="ml-1" />
              </button>

              {showSpeedDropdown && (
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-md shadow-lg py-1 z-10 min-w-16">
                  {speeds.map(speed => (
                    <button
                      key={speed}
                      onClick={() => {
                        handlePlaybackRateChange(speed);
                        setShowSpeedDropdown(false);
                      }}
                      className={cn(
                        "block w-full text-left px-3 py-1 text-xs",
                        speed === playbackRate 
                          ? "bg-[#5e16ea] bg-opacity-10 text-[#5e16ea]" 
                          : "hover:bg-gray-100"
                      )}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Locked message */}
      {!canPlay && (
        <div className="text-center py-2">
          <p className="text-xs text-gray-400">
            Completa las lecciones anteriores para desbloquear
          </p>
        </div>
      )}
    </div>
  );
});

LessonCard.displayName = 'LessonCard';

export default LessonCard;
