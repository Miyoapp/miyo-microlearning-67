
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useCourseData } from '@/hooks/useCourseData';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';
import { useCourseRealtimeSync } from '@/hooks/course/useCourseRealtimeSync';
import { useCourseAccess } from '@/hooks/course/useCourseAccess';
import CoursePageHeader from '@/components/course/CoursePageHeader';
import CourseLoadingSkeleton from '@/components/course/CourseLoadingSkeleton';
import CourseErrorState from '@/components/course/CourseErrorState';
import CourseNotFoundState from '@/components/course/CourseNotFoundState';
import CourseAccessHandler from '@/components/course/CourseAccessHandler';

const DashboardCourse = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { podcast, setPodcast, isLoading: courseLoading, error: courseError, retry: retryCourse } = useCourseData(courseId);
  const { userProgress, loading: progressLoading, refetch, startCourse, toggleSaveCourse } = useUserProgress();
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Course access and premium status
  const { isPremium, hasAccess, isLoading: accessLoading, error: accessError, refetchPurchases } = useCourseAccess(podcast);
  
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
  
  // Set up realtime sync
  useCourseRealtimeSync({
    podcast,
    initializePodcastWithProgress,
    refetch
  });
  
  // CRITICAL FIX: Proper empty data handling
  const courseProgress = userProgress.find(p => p.course_id === courseId) || null;
  const isSaved = courseProgress?.is_saved || false;
  const hasStarted = (courseProgress?.progress_percentage || 0) > 0;
  const progressPercentage = courseProgress?.progress_percentage || 0;
  const isCompleted = courseProgress?.is_completed || false;
  const isReviewMode = isCompleted && progressPercentage === 100;

  // CRITICAL DEBUG: Log access state
  console.log('🎭 DASHBOARD COURSE ACCESS STATE:', {
    courseId,
    courseLoading,
    progressLoading,
    accessLoading,
    isPremium,
    hasAccess,
    podcast: !!podcast,
    courseTitle: podcast?.title,
    courseError,
    accessError,
    userProgressLength: userProgress.length,
    courseProgress: !!courseProgress
  });

  // Handle any errors that occurred
  const hasError = courseError || accessError;
  
  // CRITICAL FIX: Only show loading when actually loading data, not when arrays are empty
  const isActuallyLoading = courseLoading || accessLoading || (progressLoading && userProgress === undefined);

  const handleStartLearning = async () => {
    if (podcast) {
      if (isPremium && !hasAccess) {
        console.log('🔒 Premium course without access - showing checkout');
        setShowCheckout(true);
        return;
      }

      await startCourse(podcast.id);
      await refetch();
      
      // Scroll to the learning path section
      const learningPathElement = document.getElementById('learning-path-section');
      if (learningPathElement) {
        learningPathElement.scrollIntoView({ behavior: 'smooth' });
      }
      console.log('Started learning course:', podcast.title);
    }
  };

  const handleToggleSave = () => {
    if (podcast) {
      toggleSaveCourse(podcast.id);
    }
  };

  const handlePurchaseComplete = () => {
    console.log('🎉 Purchase completed, refetching purchases...');
    refetchPurchases();
  };

  const handleLessonSelect = (lesson: any) => {
    // Check if user has access to this lesson
    if (isPremium && !hasAccess) {
      console.log('🔒 Lesson access denied - showing checkout');
      setShowCheckout(true);
      return;
    }
    
    // Use manual selection flag to prevent auto-play interference
    handleSelectLesson(lesson, true);
  };

  const handleRetry = () => {
    console.log('🔄 Manual retry triggered from UI');
    retryCourse();
    if (accessError) {
      refetchPurchases();
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  // Determine loading message
  const getLoadingMessage = () => {
    if (courseLoading) return 'Cargando curso...';
    if (accessLoading) return 'Verificando acceso...';
    if (progressLoading) return 'Cargando progreso...';
    return 'Cargando...';
  };

  // CRITICAL FIX: Only show skeleton loading when data is actually being fetched
  if (isActuallyLoading) {
    return (
      <DashboardLayout>
        <CourseLoadingSkeleton loadingMessage={getLoadingMessage()} />
      </DashboardLayout>
    );
  }

  // Error state: show error with retry option
  if (hasError) {
    return (
      <DashboardLayout>
        <CourseErrorState
          error={courseError || accessError || 'Ha ocurrido un error inesperado.'}
          onRetry={handleRetry}
          onGoBack={handleGoBack}
        />
      </DashboardLayout>
    );
  }

  // Course not found state
  if (!podcast) {
    return (
      <DashboardLayout>
        <CourseNotFoundState
          courseId={courseId}
          onRetry={handleRetry}
          onGoBack={handleGoBack}
        />
      </DashboardLayout>
    );
  }

  // SUCCESS: Render course content even with empty user data
  // Empty arrays are valid states for new users
  console.log('✅ Rendering course content:', {
    courseTitle: podcast.title,
    hasUserProgress: userProgress.length > 0,
    courseProgress: !!courseProgress,
    isPremium,
    hasAccess,
    emptyDataIsValid: true
  });

  return (
    <>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto pb-20 sm:pb-24">
          <CoursePageHeader isReviewMode={isReviewMode} />
          
          <CourseAccessHandler
            podcast={podcast}
            currentLesson={currentLesson}
            hasStarted={hasStarted}
            isSaved={isSaved}
            progressPercentage={progressPercentage}
            isCompleted={isCompleted}
            isPremium={isPremium}
            hasAccess={hasAccess}
            isPlaying={isPlaying}
            showCheckout={showCheckout}
            onStartLearning={handleStartLearning}
            onToggleSave={handleToggleSave}
            onSelectLesson={handleLessonSelect}
            onShowCheckout={() => setShowCheckout(true)}
            onCloseCheckout={() => setShowCheckout(false)}
            onTogglePlay={handleTogglePlay}
            onLessonComplete={handleLessonComplete}
            onProgressUpdate={handleProgressUpdate}
            onPurchaseComplete={handlePurchaseComplete}
          />
        </div>
      </DashboardLayout>
    </>
  );
};

export default DashboardCourse;
