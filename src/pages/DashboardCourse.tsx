import React, { useState, useRef, useEffect } from 'react';
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
  
  // ENHANCED STABLE REFERENCE: Keep last valid podcast with timeout-based cleanup
  const lastValidPodcast = useRef(podcast);
  const podcastClearTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Track component lifecycle for subscription debugging
  useEffect(() => {
    console.log('🎭 DASHBOARD COURSE: Component mounted/updated', {
      courseId,
      timestamp: new Date().toISOString(),
      documentVisibilityState: document.visibilityState
    });

    return () => {
      console.log('🎭 DASHBOARD COURSE: Component cleanup initiated', {
        courseId,
        timestamp: new Date().toISOString()
      });
    };
  }, [courseId]);
  
  if (podcast) {
    lastValidPodcast.current = podcast;
    // Clear any pending timeout to clear the reference
    if (podcastClearTimeout.current) {
      clearTimeout(podcastClearTimeout.current);
      podcastClearTimeout.current = null;
    }
  } else if (lastValidPodcast.current && !podcastClearTimeout.current) {
    // Only start timeout if we had valid data and no timeout is running
    podcastClearTimeout.current = setTimeout(() => {
      console.log('🕐 TIMEOUT: Clearing stable podcast reference after extended period without data');
      lastValidPodcast.current = null;
      podcastClearTimeout.current = null;
    }, 30000); // 30 second timeout to prevent permanent stale data
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
  
  // Course progress calculations
  const courseProgress = userProgress.find(p => p.course_id === courseId) || null;
  const isSaved = courseProgress?.is_saved || false;
  const hasStarted = (courseProgress?.progress_percentage || 0) > 0;
  const progressPercentage = courseProgress?.progress_percentage || 0;
  const isCompleted = courseProgress?.is_completed || false;
  const isReviewMode = isCompleted && progressPercentage === 100;

  // DEFINITIVE DISPLAY PODCAST: Always prefer current, with stable fallback
  const displayPodcast = podcast || lastValidPodcast.current;

  // TAB SWITCH DETECTION: Enhanced logging for realtime subscription tracking
  console.log('🎭 TAB SWITCH & REALTIME DIAGNOSTIC - DASHBOARD COURSE STATE:', {
    timestamp: new Date().toISOString(),
    documentHidden: document.hidden,
    documentVisibilityState: document.visibilityState,
    courseId,
    dataStates: {
      courseLoading,
      progressLoading,
      accessLoading,
      hasPodcast: !!podcast,
      hasLastValidPodcast: !!lastValidPodcast.current,
      hasDisplayPodcast: !!displayPodcast,
      userProgressCount: userProgress.length,
      timeoutActive: !!podcastClearTimeout.current
    },
    realtimeInfo: {
      componentsWithSubscriptions: ['useCoursePurchases', 'useRealtimeProgress', 'useLessonProgressData'],
      expectedSubscriptionCount: 3,
      tabSwitchSafe: 'PROTECTED_BY_SUBSCRIPTION_MANAGER'
    },
    renderDecision: {
      shouldShowContent: !!displayPodcast,
      hasError: !!(courseError || accessError),
      isLoadingWithoutData: !displayPodcast && (courseLoading || progressLoading),
      stableReferenceProtection: !!lastValidPodcast.current && !podcast
    }
  });

  // SIMPLIFIED LOADING LOGIC: Only show loading if we truly have no data
  const isActuallyLoading = !displayPodcast && (courseLoading || progressLoading);
  
  // Error handling
  const hasError = courseError || accessError;

  // DEFINITIVE RENDER GUARD: Always show content if we have valid data
  const shouldShowContent = !!displayPodcast;

  console.log('🔒 FINAL RENDER DECISION (REALTIME PROTECTED):', {
    shouldShowContent,
    isActuallyLoading,
    hasError: !!hasError,
    displayPodcastValid: !!displayPodcast,
    courseTitle: displayPodcast?.title,
    guaranteedRender: shouldShowContent ? 'YES - CONTENT WILL RENDER' : 'NO - FALLBACK STATE',
    realtimeSubscriptionProtection: 'ACTIVE'
  });

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
    
    // Use simple selection without manual flag
    handleSelectLesson(lesson);
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

  // PRIORITY 1: Show content if we have valid data (NEVER BLANK SCREEN)
  if (shouldShowContent) {
    console.log('✅ RENDERING CONTENT - Guaranteed non-blank screen with realtime protection:', {
      courseTitle: displayPodcast.title,
      isCurrentData: !!podcast,
      isStableReference: !podcast && !!lastValidPodcast.current,
      hasUserProgress: userProgress.length > 0,
      courseProgress: !!courseProgress,
      renderStrategy: 'CONTENT_PRIORITY',
      realtimeProtection: 'SUBSCRIPTION_MANAGER_ACTIVE'
    });

    return (
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
    );
  }

  // PRIORITY 2: Show error state only if we have an error AND no content
  if (hasError && !shouldShowContent) {
    console.log('❌ Showing error state:', { courseError, accessError, hasValidContent: false });
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

  // PRIORITY 3: Show course not found only if we confirmed no data exists
  if (!isActuallyLoading && !shouldShowContent) {
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

  // PRIORITY 4: Show loading only as last resort
  console.log('🔄 Showing loading state (last resort):', { 
    isActuallyLoading, 
    reason: 'no valid data available and still loading'
  });
  return (
    <DashboardLayout>
      <CourseLoadingSkeleton loadingMessage="Cargando curso..." />
    </DashboardLayout>
  );
};

export default DashboardCourse;
