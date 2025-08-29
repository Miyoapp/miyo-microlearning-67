
import React from 'react';
import { Podcast, Lesson } from '@/types';
import CourseHeader from './CourseHeader';
import CourseLearningPathSection from './CourseLearningPathSection';
import CourseSidebar from './CourseSidebar';
import PremiumOverlay from './PremiumOverlay';

interface CourseMainContentProps {
  podcast: Podcast;
  currentLesson: Lesson | null;
  hasStarted: boolean;
  isSaved: boolean;
  progressPercentage: number;
  isCompleted: boolean;
  isPremium: boolean;
  hasAccess: boolean;
  onStartLearning: () => void;
  onToggleSave: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  onShowCheckout: () => void;
  onProgressUpdate: (position: number) => void;
  onLessonComplete: () => void;
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

const CourseMainContent: React.FC<CourseMainContentProps> = ({
  podcast,
  currentLesson,
  hasStarted,
  isSaved,
  progressPercentage,
  isCompleted,
  isPremium,
  hasAccess,
  onStartLearning,
  onToggleSave,
  onSelectLesson,
  onShowCheckout,
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
      {/* Main Content - Full width on mobile */}
      <div className="lg:col-span-2">
        <CourseHeader
          podcast={podcast}
          hasStarted={hasStarted}
          isSaved={isSaved}
          progressPercentage={progressPercentage}
          onStartLearning={onStartLearning}
          onToggleSave={onToggleSave}
        />

        <div className="relative mx-4 sm:mx-0">
          <CourseLearningPathSection
            podcast={podcast}
            onSelectLesson={onSelectLesson}
            onProgressUpdate={onProgressUpdate}
            onLessonComplete={onLessonComplete}
            // Pass through all unified audio player props
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
          
          {/* Premium overlay for learning path */}
          {isPremium && !hasAccess && (
            <PremiumOverlay
              onUnlock={onShowCheckout}
              price={podcast.precio || 0}
              currency={podcast.moneda || 'USD'}
            />
          )}
        </div>
      </div>

      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <CourseSidebar 
          podcast={podcast}
          progressPercentage={progressPercentage}
          isCompleted={isCompleted}
        />
      </div>
    </div>
  );
};

export default CourseMainContent;
