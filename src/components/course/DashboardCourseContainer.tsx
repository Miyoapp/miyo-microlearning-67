
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useRealtimeManager } from '@/hooks/useRealtimeManager';
import CoursePageHeader from '@/components/course/CoursePageHeader';
import CourseMainContent from '@/components/course/CourseMainContent';
import CourseErrorBoundary from '@/components/course/CourseErrorBoundary';
import CourseLoadingDetailed from '@/components/course/CourseLoadingDetailed';
import AudioPlayer from '@/components/AudioPlayer';
import CheckoutModal from '@/components/course/CheckoutModal';
import { useDashboardCourseState } from '@/hooks/course/useDashboardCourseState';
import { useDashboardCourseActions } from '@/hooks/course/useDashboardCourseActions';

const DashboardCourseContainer: React.FC = () => {
  const {
    courseId,
    podcast,
    currentLesson,
    isPlaying,
    isLoading,
    isPremium,
    hasAccess,
    errorState,
    loadingState,
    showCheckout,
    setShowCheckout,
    isSaved,
    hasStarted,
    progressPercentage,
    isCompleted,
    isReviewMode,
    handleSelectLesson,
    handleTogglePlay,
    handleLessonComplete,
    handleProgressUpdate,
    initializePodcastWithProgress,
    refetchPurchases,
    refetchUserProgress,
    toggleSaveCourse,
    startCourse
  } = useDashboardCourseState();

  const {
    handleStartLearning,
    handleToggleSave,
    handlePurchaseComplete,
    handleLessonSelect,
    handleRetry
  } = useDashboardCourseActions({
    podcast,
    isPremium,
    hasAccess,
    startCourse,
    refetchUserProgress,
    toggleSaveCourse,
    refetchPurchases,
    handleSelectLesson,
    setShowCheckout
  });

  // Centralizar TODAS las suscripciones realtime en un solo lugar
  useRealtimeManager({
    onLessonProgressUpdate: () => {
      console.log('🔄 Realtime lesson progress update detected, refreshing podcast progress');
      if (podcast) {
        initializePodcastWithProgress();
      }
    },
    onCourseProgressUpdate: () => {
      console.log('🔄 Realtime course progress update detected, refreshing user progress');
      refetchUserProgress();
    },
    onPurchaseUpdate: () => {
      console.log('🔄 Realtime purchase update detected, refreshing purchases');
      refetchPurchases();
    },
    enabled: !!podcast // Solo activar cuando tenemos un curso cargado
  });

  // Error state
  if (errorState.course && !isLoading) {
    return (
      <DashboardLayout>
        <CourseErrorBoundary
          error={errorState.course}
          courseId={courseId}
          onRetry={handleRetry}
        />
      </DashboardLayout>
    );
  }

  // Loading state with detailed progress
  if (isLoading) {
    return (
      <DashboardLayout>
        <CourseLoadingDetailed
          loadingState={loadingState}
          courseId={courseId}
        />
      </DashboardLayout>
    );
  }

  // Not found state
  if (!podcast) {
    return (
      <DashboardLayout>
        <CourseErrorBoundary
          error="El curso que buscas no existe o no está disponible."
          courseId={courseId}
          onRetry={handleRetry}
        />
      </DashboardLayout>
    );
  }

  // Success state
  return (
    <>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto pb-20 sm:pb-24">
          <CoursePageHeader isReviewMode={isReviewMode} />
          
          <CourseMainContent
            podcast={podcast}
            currentLesson={currentLesson}
            hasStarted={hasStarted}
            isSaved={isSaved}
            progressPercentage={progressPercentage}
            isCompleted={isCompleted}
            isPremium={isPremium}
            hasAccess={hasAccess}
            onStartLearning={handleStartLearning}
            onToggleSave={handleToggleSave}
            onSelectLesson={handleLessonSelect}
            onShowCheckout={() => setShowCheckout(true)}
          />
        </div>
      </DashboardLayout>
      
      {/* Audio player - only show when there's a current lesson and user has access */}
      {currentLesson && hasAccess && (
        <AudioPlayer 
          lesson={currentLesson}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onComplete={handleLessonComplete}
          onProgressUpdate={handleProgressUpdate}
        />
      )}

      {/* Checkout Modal */}
      {isPremium && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
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

export default DashboardCourseContainer;
