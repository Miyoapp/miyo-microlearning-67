
import React from 'react';
import { Lesson } from '@/types';
import { Play, Lock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import LessonMiniPlayer from './LessonMiniPlayer';
import { useLessonMiniPlayer } from '@/hooks/learning-path/useLessonMiniPlayer';

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
    cardBackgroundClasses: string;
    nodeClasses: string;
    textClasses: string;
  };
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
  onLessonComplete: () => void;
  onProgressUpdate: (position: number) => void;
  isActiveMiniPlayer: boolean;
  onActivatePlayer: () => void;
}

const LessonItem = React.memo(({ 
  lesson, 
  index, 
  status, 
  classes, 
  onLessonClick,
  onLessonComplete,
  onProgressUpdate,
  isActiveMiniPlayer,
  onActivatePlayer
}: LessonItemProps) => {
  const { isCompleted, isCurrent, canPlay } = status;
  const { cardBackgroundClasses, nodeClasses, textClasses } = classes;
  
  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isMuted,
    handleTogglePlay,
    handleSeek,
    handleSkipBack,
    handleSkipForward,
    handleVolumeChange,
    handleToggleMute,
    handlePlaybackRateChange,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleEnded
  } = useLessonMiniPlayer({
    lesson,
    isActive: isActiveMiniPlayer,
    onLessonComplete,
    onProgressUpdate
  });

  const handlePlayClick = () => {
    if (canPlay) {
      onActivatePlayer();
      onLessonClick(lesson, true);
    }
  };

  const handleMiniPlayerToggle = () => {
    if (!isActiveMiniPlayer) {
      onActivatePlayer();
      onLessonClick(lesson, true);
    }
    handleTogglePlay();
  };
  
  return (
    <div className={cn(cardBackgroundClasses, "mb-4")}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={lesson.urlAudio}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      
      {/* Header Row */}
      <div className="flex items-start space-x-3">
        {/* Status Icon */}
        <div 
          className={cn(nodeClasses, "mt-1 flex-shrink-0")}
          onClick={handlePlayClick}
        >
          {isCompleted ? (
            <Trophy size={14} />
          ) : canPlay ? (
            <Play size={14} fill="white" />
          ) : (
            <Lock size={14} />
          )}
        </div>
        
        {/* Lesson Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={cn(textClasses, "leading-snug")}>
              {lesson.title}
              {isCurrent && (
                <span className="ml-2 text-xs text-green-600">● Reproduciendo</span>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              {Math.floor(lesson.duracion)}:{((lesson.duracion % 1) * 60).toFixed(0).padStart(2, '0')}
            </div>
          </div>
          
          {/* Mini Player - Only show for available lessons */}
          {canPlay && (
            <LessonMiniPlayer
              lesson={lesson}
              isPlaying={isPlaying && isActiveMiniPlayer}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              playbackRate={playbackRate}
              isMuted={isMuted}
              onTogglePlay={handleMiniPlayerToggle}
              onSeek={handleSeek}
              onSkipBack={handleSkipBack}
              onSkipForward={handleSkipForward}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
              onPlaybackRateChange={handlePlaybackRateChange}
            />
          )}
          
          {/* Locked message */}
          {!canPlay && (
            <p className="text-xs text-gray-400 mt-1">
              Completa las lecciones anteriores para desbloquear
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

LessonItem.displayName = 'LessonItem';

export default LessonItem;
