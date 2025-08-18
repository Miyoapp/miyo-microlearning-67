
import React from 'react';
import { Podcast, Lesson } from '@/types';
import CourseMainContent from './CourseMainContent';
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
  isPlaying: boolean;
  showCheckout: boolean;
  onStartLearning: () => void;
  onToggleSave: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  onShowCheckout: () => void;
  onCloseCheckout: () => void;
  onTogglePlay: () => void;
  onLessonComplete: () => void;
  onProgressUpdate: (position: number) => void;
  onPurchaseComplete: () => void;
  // NEW: Audio control props
  globalCurrentTime?: number;
  globalDuration?: number;
  onSeek?: (value: number) => void;
  onSkipBackward?: () => void;
  onSkipForward?: () => void;
  onPlaybackRateChange?: (rate: number) => void;
}

const CourseAccessHandler: React.FC<CourseAccessHandlerProps> = ({
  podcast,
  currentLesson,
  hasStarted,
  isSaved,
  progressPercentage,
  isCompleted,
  isPremium,
  hasAccess,
  isPlaying,
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
  globalCurrentTime = 0,
  globalDuration = 0,
  onSeek,
  onSkipBackward,
  onSkipForward,
  onPlaybackRateChange
}) => {
  return (
    <>
      <CourseMainContent
        podcast={podcast}
        currentLesson={currentLesson}
        hasStarted={hasStarted}
        isSaved={isSaved}
        progressPercentage={progressPercentage}
        isCompleted={isCompleted}
        isPremium={isPremium}
        hasAccess={hasAccess}
        isGloballyPlaying={isPlaying}
        onStartLearning={onStartLearning}
        onToggleSave={onToggleSave}
        onSelectLesson={onSelectLesson}
        onShowCheckout={onShowCheckout}
        globalCurrentTime={globalCurrentTime}
        globalDuration={globalDuration}
        onSeek={onSeek}
        onSkipBackward={onSkipBackward}
        onSkipForward={onSkipForward}
        onPlaybackRateChange={onPlaybackRateChange}
      />

      {showCheckout && (
        <CheckoutModal
          podcast={podcast}
          onClose={onCloseCheckout}
          onPurchaseComplete={onPurchaseComplete}
        />
      )}
    </>
  );
};

export default CourseAccessHandler;
