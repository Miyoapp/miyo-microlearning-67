
import React from 'react';
import { Podcast, Lesson } from '@/types';
import CourseHero from './CourseHero';
import CourseLearningPathSection from './CourseLearningPathSection';
import CheckoutModal from './CheckoutModal';

interface CourseAccessHandlerProps {
  podcast: Podcast;
  currentLesson: Lesson | null;
  hasStarted: boolean;
  isSaved: boolean;
  progressPercentage: number;
  isCompleted: boolean;
  isPremium: boolean;
  hasAccess: boolean;
  showCheckout: boolean;
  onStartLearning: () => void;
  onToggleSave: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  onShowCheckout: () => void;
  onCloseCheckout: () => void;
  onTogglePlay: () => void;
  onLessonComplete?: () => void;
  onProgressUpdate?: (position: number) => void;
  onPurchaseComplete: () => void;
  // UNIFIED AUDIO PROPS - single source of truth
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

const CourseAccessHandler = ({
  podcast,
  currentLesson,
  hasStarted,
  isSaved,
  progressPercentage,
  isCompleted,
  isPremium,
  hasAccess,
  showCheckout,
  onStartLearning,
  onToggleSave,
  onSelectLesson,
  onShowCheckout,
  onCloseCheckout,
  onTogglePlay,
  onLessonComplete,
  onProgressUpdate,
  onPurchaseComplete,
  // UNIFIED AUDIO PROPS
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
}: CourseAccessHandlerProps) => {
  console.log('🔒 CourseAccessHandler render:', {
    courseTitle: podcast.title,
    isPremium,
    hasAccess,
    hasStarted,
    audioCurrentLessonId,
    audioIsPlaying
  });

  return (
    <>
      {/* Course Hero Section */}
      <CourseHero
        podcast={podcast}
        currentLesson={currentLesson}
        hasStarted={hasStarted}
        isSaved={isSaved}
        progressPercentage={progressPercentage}
        isCompleted={isCompleted}
        isPremium={isPremium}
        hasAccess={hasAccess}
        onStartLearning={onStartLearning}
        onToggleSave={onToggleSave}
        onShowCheckout={onShowCheckout}
        onTogglePlay={onTogglePlay}
        // UNIFIED AUDIO PROPS
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

      {/* Learning Path Section - Only show if course has started */}
      {hasStarted && (
        <CourseLearningPathSection
          podcast={podcast}
          currentLessonId={audioCurrentLessonId}
          isGloballyPlaying={audioIsPlaying}
          onSelectLesson={onSelectLesson}
          onProgressUpdate={onProgressUpdate}
          onLessonComplete={onLessonComplete}
          // UNIFIED AUDIO PROPS
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
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={onCloseCheckout}
        course={podcast}
        onPurchaseComplete={onPurchaseComplete}
      />
    </>
  );
};

export default CourseAccessHandler;
