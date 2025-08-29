
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
      />

      {/* Learning Path Section - Show if course started, is free, or user has access */}
      {console.log('🔍 Render conditions:', { 
        hasStarted, 
        isPremium, 
        hasAccess, 
        shouldRender: hasStarted || !isPremium || hasAccess 
      })}
      {(hasStarted || !isPremium || hasAccess) && (
        <CourseLearningPathSection
          podcast={podcast}
          onSelectLesson={onSelectLesson}
          onProgressUpdate={onProgressUpdate}
          onLessonComplete={onLessonComplete}
          // UNIFIED AUDIO PROPS - pass only unified audio state
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

      {/* Checkout Modal - Handle optional precio */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={onCloseCheckout}
        course={{
          id: podcast.id,
          title: podcast.title,
          precio: podcast.precio || 0,
          imageUrl: podcast.imageUrl,
          moneda: podcast.moneda
        }}
        onPurchaseComplete={onPurchaseComplete}
      />
    </>
  );
};

export default CourseAccessHandler;
