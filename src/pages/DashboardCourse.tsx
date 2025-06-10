
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useCourseData } from '@/hooks/useCourseData';
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';
import { useRealtimeProgress } from '@/hooks/useRealtimeProgress';
import { useCourseAccess } from '@/hooks/course/useCourseAccess';
import { useCourseActions } from '@/hooks/course/useCourseActions';
import { useCourseState } from '@/hooks/course/useCourseState';
import ReviewModeIndicator from '@/components/course/ReviewModeIndicator';
import CourseLoadingStates from '@/components/course/CourseLoadingStates';
import CourseMainContent from '@/components/course/CourseMainContent';
import CourseSidebar from '@/components/course/CourseSidebar';
import AudioPlayer from '@/components/AudioPlayer';
import CheckoutModal from '@/components/course/CheckoutModal';

const DashboardCourse = () => {
  const { id } = useParams<{ id: string }>();
  const { podcast, setPodcast, isLoading } = useCourseData(id);
  const { isPremium, hasAccess } = useCourseAccess(podcast);
  const { isReviewMode, progressPercentage, hasStarted, isSaved, isCompleted } = useCourseState(id);
  
  // Use consolidated lessons hook
  const { 
    currentLesson, 
    isPlaying, 
    initializeCurrentLesson,
    handleSelectLesson, 
    handleTogglePlay, 
    handleLessonComplete,
    handleProgressUpdate,
    initializePodcastWithProgress
  } = useConsolidatedLessons(podcast, setPodcast);

  // Course actions
  const {
    showCheckout,
    setShowCheckout,
    handleStartLearning,
    handleToggleSave,
    handleLessonSelect,
    handlePurchaseComplete
  } = useCourseActions({
    podcast,
    isPremium,
    hasAccess,
    handleSelectLesson
  });
  
  // Set up realtime progress updates
  useRealtimeProgress({
    onLessonProgressUpdate: () => {
      console.log('🔄 Realtime lesson progress update detected, refreshing podcast progress');
      if (podcast) {
        initializePodcastWithProgress();
      }
    },
    onCourseProgressUpdate: () => {
      console.log('🔄 Realtime course progress update detected, refreshing user progress');
    }
  });

  // Initialize podcast and current lesson when data is loaded
  useEffect(() => {
    if (podcast) {
      console.log('Podcast loaded, initializing...');
      initializePodcastWithProgress();
    }
  }, [podcast?.id, initializePodcastWithProgress]);

  // Handle loading and error states
  const loadingComponent = CourseLoadingStates({ isLoading, podcast });
  if (loadingComponent) return loadingComponent;

  return (
    <>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto pb-24">
          <ReviewModeIndicator isReviewMode={isReviewMode} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <CourseMainContent
              podcast={podcast}
              hasStarted={hasStarted}
              isSaved={isSaved}
              progressPercentage={progressPercentage}
              currentLessonId={currentLesson?.id || null}
              isPremium={isPremium}
              hasAccess={hasAccess}
              onStartLearning={handleStartLearning}
              onToggleSave={handleToggleSave}
              onSelectLesson={handleLessonSelect}
              onUnlock={() => setShowCheckout(true)}
            />

            <CourseSidebar 
              podcast={podcast}
              progressPercentage={progressPercentage}
              isCompleted={isCompleted}
            />
          </div>
        </div>
      </DashboardLayout>
      
      {/* Audio Player - Only show if user has access */}
      {hasAccess && (
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

export default DashboardCourse;
