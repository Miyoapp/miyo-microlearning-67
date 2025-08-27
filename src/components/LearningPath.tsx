
import React from 'react';
import { Podcast } from '@/types';
import { UserLessonProgress } from '@/hooks/lesson-progress/types';
import ModuleSection from './learning-path/ModuleSection';

interface LearningPathProps {
  podcast: Podcast;
  // Reproductor centralizado
  currentLesson: any;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  lessonProgress: UserLessonProgress[];
  // Callbacks
  onLessonClick: (lesson: any, shouldAutoPlay?: boolean) => void;
  onSeek: (time: number) => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  formatTime: (time: number) => string;
}

const LearningPath = React.memo(({
  podcast,
  currentLesson,
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  volume,
  isMuted,
  lessonProgress,
  onLessonClick,
  onSeek,
  onSkipBackward,
  onSkipForward,
  onPlaybackRateChange,
  onVolumeChange,
  onToggleMute,
  formatTime
}: LearningPathProps) => {
  if (!podcast.modules || podcast.modules.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay módulos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {podcast.modules.map((module) => (
        <ModuleSection
          key={module.id}
          module={module}
          currentLesson={currentLesson}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          playbackRate={playbackRate}
          volume={volume}
          isMuted={isMuted}
          courseId={podcast.id}
          lessonProgress={lessonProgress}
          onLessonClick={onLessonClick}
          onSeek={onSeek}
          onSkipBackward={onSkipBackward}
          onSkipForward={onSkipForward}
          onPlaybackRateChange={onPlaybackRateChange}
          onVolumeChange={onVolumeChange}
          onToggleMute={onToggleMute}
          formatTime={formatTime}
        />
      ))}
    </div>
  );
});

LearningPath.displayName = 'LearningPath';

export default LearningPath;
