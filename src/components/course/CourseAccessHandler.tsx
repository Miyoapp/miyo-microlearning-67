
import React from 'react';
import { Podcast, Lesson } from '@/types';
import CourseMainContent from './CourseMainContent';
import AudioPlayer from '@/components/AudioPlayer';
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
  onProgressUpdate: (progress: number) => void;
  onPurchaseComplete: () => void;
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
  onPurchaseComplete
}) => {
  // DIAGNOSTIC: Monitor props validity during render
  console.log('🎬 COURSE ACCESS HANDLER RENDER:', {
    timestamp: new Date().toISOString(),
    podcastValid: !!podcast,
    podcastId: podcast?.id,
    podcastTitle: podcast?.title,
    currentLessonValid: !!currentLesson,
    currentLessonId: currentLesson?.id,
    hasStarted,
    isSaved,
    progressPercentage,
    isCompleted,
    isPremium,
    hasAccess,
    isPlaying,
    showCheckout,
    propsReceived: {
      podcast: podcast ? 'valid' : 'invalid',
      currentLesson: currentLesson ? 'valid' : 'null',
      hasAccess: hasAccess ? 'granted' : 'denied'
    }
  });

  // GUARD: Ensure podcast is valid before rendering
  if (!podcast) {
    console.error('❌ CourseAccessHandler received invalid podcast prop');
    return null;
  }

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
        onStartLearning={onStartLearning}
        onToggleSave={onToggleSave}
        onSelectLesson={onSelectLesson}
        onShowCheckout={onShowCheckout}
      />
      
      {/* Audio player - only show when there's a current lesson and user has access */}
      {currentLesson && hasAccess && (
        <AudioPlayer 
          lesson={currentLesson}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onComplete={onLessonComplete}
          onProgressUpdate={onProgressUpdate}
        />
      )}

      {/* Checkout Modal */}
      {isPremium && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={onCloseCheckout}
          course={{
            id: podcast.id,
            title: podcast.title,
            precio: podcast.precio || 0,
            imageUrl: podcast.imageUrl,
            moneda: podcast.moneda || 'USD'
          }}
          onPurchaseComplete={onPurchaseComplete}
        />
      )}
    </>
  );
};

export default CourseAccessHandler;
