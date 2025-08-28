
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
        onProgressUpdate={onProgressUpdate}
        onLessonComplete={onLessonComplete}
        // Pass audio player props
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

      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          course={{
            id: podcast.id,
            title: podcast.title,
            precio: podcast.precio || 0,
            imageUrl: podcast.imageUrl,
            moneda: podcast.moneda
          }}
          onClose={onCloseCheckout}
          onPurchaseComplete={onPurchaseComplete}
        />
      )}
    </>
  );
};

export default CourseAccessHandler;
