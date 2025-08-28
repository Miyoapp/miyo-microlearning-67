
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
import CourseErrorBoundary from '@/components/course/CourseErrorBoundary';
import MetaTags from '@/components/MetaTags';
import { NotesProvider } from '@/contexts/NotesContext';

const DashboardCourse = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { podcast, setPodcast, isLoading: courseLoading, error: courseError, retry: retryCourse } = useCourseData(courseId);
  const { userProgress, loading: progressLoading, refetch, startCourse, toggleSaveCourse } = useUserProgress();
  const [showCheckout, setShowCheckout] = useState(false);
  
  // ENHANCED STABLE REFERENCE with timeout-based cleanup
  const lastValidPodcast = useRef(podcast);
  const podcastClearTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Track component lifecycle for debugging
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
    if (podcastClearTimeout.current) {
      clearTimeout(podcastClearTimeout.current);
      podcastClearTimeout.current = null;
    }
  } else if (lastValidPodcast.current && !podcastClearTimeout.current) {
    podcastClearTimeout.current = setTimeout(() => {
      console.log('🕐 TIMEOUT: Clearing stable podcast reference after extended period without data');
      lastValidPodcast.current = null;
      podcastClearTimeout.current = null;
    }, 30000);
  }
  
  // Course access and premium status
  const { isPremium, hasAccess, isLoading: accessLoading, error: accessError, refetchPurchases } = useCourseAccess(podcast);
  
  // UNIFIED: Use consolidated lessons hook with single source of truth
  const { 
    currentLesson, 
    initializeCurrentLesson,
    handleSelectLesson, 
    handleTogglePlay, 
    handleLessonComplete,
    handleProgressUpdate,
    initializePodcastWithProgress,
    // UNIFIED AUDIO PLAYER STATE - single naming convention
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

  // UNIFIED: Always prefer current, with stable fallback
  const displayPodcast = podcast || lastValidPodcast.current;

  // ENHANCED LOGGING: Track all state for debugging
  console.log('🎭 UNIFIED DASHBOARD COURSE STATE:', {
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
    unifiedAudioStates: {
      audioCurrentLessonId,
      audioIsPlaying,
      audioError,
      audioIsReady
    }
  });

  // SIMPLIFIED LOADING LOGIC
  const isActuallyLoading = !displayPodcast && (courseLoading || progressLoading);
  const hasError = courseError || accessError;
  const shouldShowContent = !!displayPodcast;

  console.log('🔒 FINAL RENDER DECISION:', {
    shouldShowContent,
    isActuallyLoading,
    hasError: !!hasError,
    displayPodcastValid: !!displayPodcast,
    courseTitle: displayPodcast?.title,
    guaranteedRender: shouldShowContent ? 'YES - CONTENT WILL RENDER' : 'NO - FALLBACK STATE'
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
    if (isPremium && !hasAccess) {
      console.log('🔒 Lesson access denied - showing checkout');
      setShowCheckout(true);
      return;
    }
    
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

  // PRIORITY 1: Show content if we have valid data
  if (displayPodcast) {
    console.log('✅ RENDERING CONTENT - Guaranteed non-blank screen:', {
      courseTitle: displayPodcast.title,
      isCurrentData: !!podcast,
      isStableReference: !podcast && !!lastValidPodcast.current,
      hasUserProgress: userProgress.length > 0,
      courseProgress: !!courseProgress
    });

    return (
      <DashboardLayout>
        <CourseErrorBoundary>
          <NotesProvider>
            {/* Dynamic Meta Tags for Course */}
            <MetaTags
              title={`${displayPodcast.title} - Miyo`}
              description={displayPodcast.description}
              image={displayPodcast.imageUrl}
              url={`${window.location.origin}/dashboard/course/${courseId}`}
            />
            
            <div className="max-w-7xl mx-auto pb-8">
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
                // UNIFIED AUDIO PROPS - single source of truth
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
            </div>
          </NotesProvider>
        </CourseErrorBoundary>
      </DashboardLayout>
    );
  }

  // PRIORITY 2: Show error state only if we have an error AND no content
  if (hasError && !shouldShowContent) {
    console.log('❌ Showing error state:', { courseError, accessError, hasValidContent: false });
    return (
      <DashboardLayout>
        <CourseErrorBoundary>
          <CourseErrorState
            error={courseError || accessError || 'Ha ocurrido un error inesperado.'}
            onRetry={handleRetry}
            onGoBack={handleGoBack}
          />
        </CourseErrorBoundary>
      </DashboardLayout>
    );
  }

  // PRIORITY 3: Show course not found only if we confirmed no data exists
  if (!isActuallyLoading && !shouldShowContent) {
    console.log('📭 Showing course not found state');
    return (
      <DashboardLayout>
        <CourseErrorBoundary>
          <CourseNotFoundState
            courseId={courseId}
            onRetry={handleRetry}
            onGoBack={handleGoBack}
          />
        </CourseErrorBoundary>
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
      <CourseErrorBoundary>
        <CourseLoadingSkeleton loadingMessage="Cargando curso..." />
      </CourseErrorBoundary>
    </DashboardLayout>
  );
};

export default DashboardCourse;
