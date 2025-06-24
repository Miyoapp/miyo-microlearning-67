import React, { useState, useRef } from 'react';
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
  
  // STABLE REFERENCE: Keep last valid podcast to prevent blank screens during transitions
  const lastValidPodcast = useRef(podcast);
  if (podcast) {
    lastValidPodcast.current = podcast;
  }
  
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

  // ENHANCED DIAGNOSTIC: Log complete state during render
  console.log('🎭 DASHBOARD COURSE COMPLETE STATE:', {
    timestamp: new Date().toISOString(),
    courseId,
    dataStates: {
      courseLoading,
      progressLoading,
      accessLoading,
      userProgressLength: userProgress.length,
      userProgressIsArray: Array.isArray(userProgress)
    },
    podcastInfo: {
      podcastExists: !!podcast,
      podcastId: podcast?.id,
      podcastTitle: podcast?.title,
      lastValidPodcastExists: !!lastValidPodcast.current,
      lastValidPodcastId: lastValidPodcast.current?.id
    },
    accessInfo: {
      isPremium,
      hasAccess,
      accessError: !!accessError
    },
    progressInfo: {
      courseProgress: !!courseProgress,
      hasStarted,
      isSaved,
      progressPercentage,
      isCompleted,
      isReviewMode
    },
    errors: {
      courseError: !!courseError,
      accessError: !!accessError,
      hasAnyError: !!(courseError || accessError)
    }
  });

  // Handle any errors that occurred
  const hasError = courseError || accessError;
  
  // IMPROVED LOADING DETECTION: More precise loading state detection
  const isActuallyLoading = courseLoading || accessLoading || (progressLoading && userProgress === undefined);
  const isDataTransition = !isActuallyLoading && !podcast && lastValidPodcast.current;

  // TRANSITION PROTECTION: Use stable podcast reference during transitions
  const displayPodcast = podcast || (isDataTransition ? lastValidPodcast.current : null);

  const handleStartLearning = async () => {
    if (displayPodcast) {
      if (isPremium && !hasAccess) {
        console.log('🔒 Premium course without access - showing checkout');
        setShowCheckout(true);
        return;
      }

      await startCourse(displayPodcast.id);
      await refetch();
      
      // Scroll to the learning path section
      const learningPathElement = document.getElementById('learning-path-section');
      if (learningPathElement) {
        learningPathElement.scrollIntoView({ behavior: 'smooth' });
      }
      console.log('Started learning course:', displayPodcast.title);
    }
  };

  const handleToggleSave = () => {
    if (displayPodcast) {
      toggleSaveCourse(displayPodcast.id);
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
    if (isDataTransition) return 'Sincronizando datos...';
    return 'Cargando...';
  };

  // ENHANCED LOADING PROTECTION: Show skeleton for both loading and transitions
  if (isActuallyLoading || isDataTransition) {
    console.log('🔄 Showing loading state:', { 
      isActuallyLoading, 
      isDataTransition,
      reason: isActuallyLoading ? 'data loading' : 'data transition'
    });
    return (
      <DashboardLayout>
        <CourseLoadingSkeleton loadingMessage={getLoadingMessage()} />
      </DashboardLayout>
    );
  }

  // Error state: show error with retry option
  if (hasError) {
    console.log('❌ Showing error state:', { courseError, accessError });
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
  if (!displayPodcast) {
    console.log('📭 Showing course not found state');
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

  // SUCCESS: Render course content with stable data
  console.log('✅ Rendering course content with stable data:', {
    courseTitle: displayPodcast.title,
    hasUserProgress: userProgress.length > 0,
    courseProgress: !!courseProgress,
    isPremium,
    hasAccess,
    usingLastValidPodcast: displayPodcast === lastValidPodcast.current && !podcast,
    emptyDataIsValid: true
  });

  return (
    <>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto pb-20 sm:pb-24">
          <CoursePageHeader isReviewMode={isReviewMode} />
          
          <CourseAccessHandler
            podcast={displayPodcast}
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
