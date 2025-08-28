
import React from 'react';
import { Lesson, Podcast } from '../../types';
import CourseMainContent from './CourseMainContent';
import CheckoutModal from './CheckoutModal';
import { useCoursePurchases } from '@/hooks/useCoursePurchases';

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
  const { refetch } = useCoursePurchases();

  const handlePurchaseComplete = () => {
    refetch();
    onPurchaseComplete();
  };

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
      />

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
          onPurchaseComplete={handlePurchaseComplete}
        />
      )}
    </>
  );
};

export default CourseAccessHandler;
