
import React from 'react';
import LearningPath from '@/components/LearningPath';
import { Podcast, Lesson } from '@/types';

interface CourseLearningPathSectionProps {
  podcast: Podcast;
  currentLessonId: string | null;
  isGloballyPlaying: boolean;
  onSelectLesson: (lesson: Lesson) => void;
  // NEW: Audio control props
  globalCurrentTime?: number;
  globalDuration?: number;
  onSeek?: (value: number) => void;
  onSkipBackward?: () => void;
  onSkipForward?: () => void;
  onPlaybackRateChange?: (rate: number) => void;
}

const CourseLearningPathSection: React.FC<CourseLearningPathSectionProps> = ({
  podcast,
  currentLessonId,
  isGloballyPlaying,
  onSelectLesson,
  globalCurrentTime = 0,
  globalDuration = 0,
  onSeek,
  onSkipBackward,
  onSkipForward,
  onPlaybackRateChange
}) => {
  return (
    <div id="learning-path-section" className="bg-white rounded-2xl shadow-sm p-6">
      <LearningPath 
        lessons={podcast.lessons}
        modules={podcast.modules}
        onSelectLesson={onSelectLesson}
        currentLessonId={currentLessonId}
        isGloballyPlaying={isGloballyPlaying}
        globalCurrentTime={globalCurrentTime}
        globalDuration={globalDuration}
        onSeek={onSeek}
        onSkipBackward={onSkipBackward}
        onSkipForward={onSkipForward}
        onPlaybackRateChange={onPlaybackRateChange}
      />
    </div>
  );
};

export default CourseLearningPathSection;
