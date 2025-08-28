
import React from 'react';
import LearningPath from '@/components/LearningPath';
import { Podcast, Lesson } from '@/types';

interface CourseLearningPathSectionProps {
  podcast: Podcast;
  currentLessonId: string | null;
  isGloballyPlaying: boolean;
  onSelectLesson: (lesson: Lesson) => void;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
  // Add audio player props from consolidated hook
  audioCurrentLessonId: string | null;
  audioIsPlaying: boolean;
  audioCurrentTime: number;
  audioDuration: number;
  audioIsReady: boolean;
  audioError: boolean;
  getDisplayProgress: (lessonId: string, validDuration?: number) => number;
  onPlay: (lesson: Lesson) => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onSetPlaybackRate: (rate: number) => void;
  onSetVolume: (volume: number) => void;
  onSetMuted: (muted: boolean) => void;
}

const CourseLearningPathSection: React.FC<CourseLearningPathSectionProps> = ({
  podcast,
  currentLessonId,
  isGloballyPlaying,
  onSelectLesson,
  onProgressUpdate,
  onLessonComplete,
  // Audio player props
  audioCurrentLessonId,
  audioIsPlaying,
  audioCurrentTime,
  audioDuration,
  audioIsReady,
  audioError,
  getDisplayProgress,
  onPlay,
  onPause,
  onSeek,
  onSkipBackward,
  onSkipForward,
  onSetPlaybackRate,
  onSetVolume,
  onSetMuted
}) => {
  return (
    <div id="learning-path-section" className="bg-white rounded-2xl shadow-sm p-6">
      <LearningPath 
        lessons={podcast.lessons}
        modules={podcast.modules}
        onSelectLesson={onSelectLesson}
        currentLessonId={currentLessonId}
        isGloballyPlaying={isGloballyPlaying}
        onProgressUpdate={onProgressUpdate}
        onLessonComplete={onLessonComplete}
        podcast={podcast}
        audioCurrentLessonId={audioCurrentLessonId}
        audioIsPlaying={audioIsPlaying}
        audioCurrentTime={audioCurrentTime}
        audioDuration={audioDuration}
        audioIsReady={audioIsReady}
        audioError={audioError}
        getDisplayProgress={getDisplayProgress}
        onPlay={onPlay}
        onPause={onPause}
        onSeek={onSeek}
        onSkipBackward={onSkipBackward}
        onSkipForward={onSkipForward}
        onSetPlaybackRate={onSetPlaybackRate}
        onSetVolume={onSetVolume}
        onSetMuted={onSetMuted}
      />
    </div>
  );
};

export default CourseLearningPathSection;
