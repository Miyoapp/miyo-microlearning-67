import React from 'react';
import { Play, Pause, Lock, CheckCircle, SkipBack, SkipForward } from 'lucide-react';
import { Lesson } from '@/types';
import { useLessonCard } from '@/hooks/learning-path/useLessonCard';
import { Slider } from '@/components/ui/slider';

interface LessonCardProps {
  lesson: Lesson;
  canPlay: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  isPlaying: boolean;
  className?: string;
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
  onAudioComplete?: () => void; // NEW: Audio completion callback
  onShowCompletionModal?: () => void; // NEW: Direct modal trigger
  savedProgress?: {
    current_position: number;
    is_completed: boolean;
  };
}

const LessonCard = React.memo(({
  lesson,
  canPlay,
  isCompleted,
  isLocked,
  isCurrent,
  isPlaying: globalIsPlaying,
  className = '',
  onLessonClick,
  onProgressUpdate,
  onLessonComplete,
  onAudioComplete, // NEW
  onShowCompletionModal, // NEW
  savedProgress
}: LessonCardProps) => {
  
  // NEW: Enhanced lesson complete handler that also triggers audio completion
  const handleEnhancedLessonComplete = React.useCallback(() => {
    console.log('🏁 LessonCard - Enhanced completion for:', lesson.title);
    
    // Call original lesson complete
    if (onLessonComplete) {
      onLessonComplete();
    }
    
    // NEW: Also call audio complete for immediate modal triggering
    if (onAudioComplete) {
      console.log('🎵 LessonCard - Calling audio complete for:', lesson.title);
      onAudioComplete();
    }
  }, [lesson.title, onLessonComplete, onAudioComplete]);

  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    handlePlayPause,
    handleSeek,
    handleSkipBackward,
    handleSkipForward,
    handlePlaybackRateChange,
    handleVolumeChange,
    toggleMute,
    formatTime,
    audioRef,
    handleMetadata,
    updateTime,
    handleAudioEnded
  } = useLessonCard({
    lesson,
    canPlay,
    isCurrent,
    isPlaying: globalIsPlaying,
    onLessonClick,
    onProgressUpdate,
    onLessonComplete: handleEnhancedLessonComplete, // Use enhanced handler
    savedProgress
  });

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayTime = formatTime(currentTime);
  const displayDuration = formatTime(duration);
  
  const getPlayButtonIcon = () => {
    if (isLocked) return <Lock size={16} />;
    if (isCompleted && !isCurrent) return <CheckCircle size={16} />;
    return isPlaying ? <Pause size={16} /> : <Play size={16} />;
  };

  const getPlayButtonClass = () => {
    let baseClass = "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ";
    
    if (isLocked) {
      return baseClass + "bg-gray-200 text-gray-400 cursor-not-allowed";
    }
    
    if (isCompleted && !isCurrent) {
      return baseClass + "bg-green-100 text-green-600 hover:bg-green-200";
    }
    
    if (canPlay) {
      return baseClass + "bg-[#5e16ea] hover:bg-[#4a11ba] text-white shadow-md hover:shadow-lg";
    }
    
    return baseClass + "bg-gray-200 text-gray-400 cursor-not-allowed";
  };

  return (
    <div className={`lesson-card p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${className}`}>
      {/* Audio element for current lesson */}
      {isCurrent && audioRef && (
        <audio
          ref={audioRef}
          src={lesson.urlAudio}
          onTimeUpdate={updateTime}
          onLoadedMetadata={handleMetadata}
          onEnded={handleAudioEnded}
          preload="metadata"
        />
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <button
            onClick={handlePlayPause}
            className={getPlayButtonClass()}
            disabled={!canPlay}
          >
            {getPlayButtonIcon()}
          </button>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{lesson.title}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
              <span>{displayTime}</span>
              {duration > 0 && <span>/ {displayDuration}</span>}
              {!duration && <span>/ {lesson.duracion} min</span>}
            </div>
          </div>
        </div>

        {/* Enhanced controls for current lesson */}
        {isCurrent && (
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleSkipBackward}
              className="p-1 text-gray-600 hover:text-[#5e16ea] transition-colors"
              title="Retroceder 15s"
            >
              <SkipBack size={16} />
            </button>
            
            <button
              onClick={handleSkipForward}
              className="p-1 text-gray-600 hover:text-[#5e16ea] transition-colors"
              title="Avanzar 15s"
            >
              <SkipForward size={16} />
            </button>

            <select
              value={playbackRate}
              onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
              className="text-xs border rounded px-1 py-0.5"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {isCurrent && duration > 0 && (
        <div className="mt-3">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={([value]) => handleSeek(value)}
            className="w-full"
          />
        </div>
      )}
      
      {/* Static progress bar for non-current lessons */}
      {!isCurrent && (
        <div className="mt-3 bg-gray-200 rounded-full h-1">
          <div 
            className="bg-[#5e16ea] h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
});

LessonCard.displayName = 'LessonCard';

export default LessonCard;
