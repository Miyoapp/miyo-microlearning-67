import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useCachedCourse } from '@/hooks/queries/useCachedCourses';
import { useCachedProgressData, useUpdateCourseProgress, useToggleSaveCourse } from '@/hooks/queries/useCachedUserProgress';
import { useLessons } from '@/hooks/useLessons';
import { useCourseRealtimeSync } from '@/hooks/course/useCourseRealtimeSync';
import { useCourseAccess } from '@/hooks/course/useCourseAccess';
import { useCourseDataEffectsOptimized } from '@/hooks/course/useCourseDataEffectsOptimized';
import CoursePageHeader from '@/components/course/CoursePageHeader';
import CourseLoadingSkeleton from '@/components/course/CourseLoadingSkeleton';
import CourseErrorState from '@/components/course/CourseErrorState';
import CourseNotFoundState from '@/components/course/CourseNotFoundState';
import CourseAccessHandler from '@/components/course/CourseAccessHandler';
import MetaTags from '@/components/MetaTags';
import { NotesProvider } from '@/contexts/NotesContext';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const DashboardCourseOptimized = () => {
  const { courseId } = useParams<{ courseId: string }>();
  
  // OPTIMIZED: Use cached course data (single query instead of 4+)
  const { 
    data: podcast, 
    isLoading: courseLoading, 
    error: courseError, 
    refetch: retryCourse 
  } = useCachedCourse(courseId);
  
  // OPTIMIZED: Use cached progress data
  const { 
    userProgress, 
    isLoading: progressLoading, 
    refetch 
  } = useCachedProgressData();
  
  const updateProgressMutation = useUpdateCourseProgress();
  const toggleSaveMutation = useToggleSaveCourse();
  
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Fresh lesson progress state for immediate UI updates
  const [freshLessonProgress, setFreshLessonProgress] = useState<any[]>([]);
  
  // Audio player state
  const { 
    currentLesson, 
    isPlaying, 
    selectLesson,
    togglePlay,
    onLessonComplete,
    onProgressUpdate,
    setOnLessonCompletedCallback
  } = useAudioPlayer();
  
  // OPTIMIZED: Simplified stable reference (React Query handles caching)
  const lastValidPodcast = useRef(podcast);
  
  // Update stable reference when we have valid data
  if (podcast) {
    lastValidPodcast.current = podcast;
  }

  // Reset refs when courseId changes to prevent stale data during navigation
  useLayoutEffect(() => {
    console.log('🔄 Course ID changed, resetting state:', courseId);
    hasAutoPositioned.current = false;
    lastValidPodcast.current = undefined;
    setFreshLessonProgress([]);
  }, [courseId]);
  
  // OPTIMIZED: Use simplified effects
  useCourseDataEffectsOptimized({
    courseId,
    hasPodcast: !!podcast,
    hasError: !!courseError,
    refetchCourse: retryCourse
  });
  
  // Course access and premium status
  const { isPremium, hasAccess, isLoading: accessLoading, error: accessError, refetchPurchases } = useCourseAccess(podcast);
  
  // Use new lessons hook
  const { 
    lessonsWithProgress, 
    getNextLessonToContinue, 
    canPlayLesson,
    calculateLessonStates,
    lessonProgress: rawLessonProgress
  } = useLessons(podcast);
  
  // Sync fresh lesson progress with raw data
  useEffect(() => {
    if (rawLessonProgress && rawLessonProgress.length > 0) {
      console.log('📊 DashboardCourseOptimized: Updating fresh lesson progress', rawLessonProgress.length);
      setFreshLessonProgress([...rawLessonProgress]);
    }
  }, [rawLessonProgress]);
  
  // Refresh lessons progress when needed
  const refreshLessonsProgress = useCallback(async () => {
    if (podcast) {
      console.log('🔄 DashboardCourseOptimized: Refreshing lessons progress');
      const updatedProgress = await calculateLessonStates();
      
      // Force immediate UI update
      if (updatedProgress) {
        console.log('🔄 DashboardCourseOptimized: Force updating fresh progress');
        setFreshLessonProgress([...updatedProgress]);
      }
      console.log('✅ DashboardCourseOptimized: Lessons progress refresh complete');
    }
  }, [podcast, calculateLessonStates]);

  // Connect lessons refresh callback to audio player
  useEffect(() => {
    setOnLessonCompletedCallback(() => refreshLessonsProgress);
    return () => setOnLessonCompletedCallback(null);
  }, [refreshLessonsProgress, setOnLessonCompletedCallback]);
  
  // OPTIMIZED: Simplified realtime sync
  useCourseRealtimeSync({
    podcast,
    refetch: () => {
      refetch();
      refreshLessonsProgress();
    },
    onProgressUpdate: refreshLessonsProgress
  });
  
  // Course progress calculations
  const courseProgress = userProgress.find(p => p.course_id === courseId) || null;
  const isSaved = courseProgress?.is_saved || false;
  const hasStarted = (courseProgress?.progress_percentage || 0) > 0;
  const progressPercentage = courseProgress?.progress_percentage || 0;
  const isCompleted = courseProgress?.is_completed || false;
  const isReviewMode = isCompleted && progressPercentage === 100;

  // Display podcast with stable fallback (only if same courseId)
  const displayPodcast = podcast || 
    (lastValidPodcast.current?.id === courseId ? lastValidPodcast.current : undefined);

  // Auto-position on next lesson to continue (only once)
  const hasAutoPositioned = useRef(false);
  useEffect(() => {
    if (
      displayPodcast && 
      lessonsWithProgress.length > 0 && 
      !currentLesson && 
      !hasAutoPositioned.current
    ) {
      const nextLesson = getNextLessonToContinue();
      if (nextLesson) {
        console.log('🎯 Auto-positioning on next lesson to continue:', nextLesson.title);
        selectLesson(nextLesson, displayPodcast, false); // Don't auto-play
        hasAutoPositioned.current = true;
      }
    }
  }, [displayPodcast, lessonsWithProgress, currentLesson, getNextLessonToContinue, selectLesson]);

  console.log('🔒 OPTIMIZED DASHBOARD COURSE STATE:', {
    shouldShowContent: !!displayPodcast,
    isActuallyLoading: !displayPodcast && (courseLoading || progressLoading),
    hasError: !!(courseError || accessError),
    displayPodcastValid: !!displayPodcast,
    courseTitle: displayPodcast?.title,
    currentLesson: currentLesson?.title,
    isPlaying,
    lessonsCount: lessonsWithProgress.length,
    cacheHit: podcast && !courseLoading ? 'HIT' : 'MISS'
  });

  const isActuallyLoading = !displayPodcast && (courseLoading || progressLoading);
  const hasError = courseError || accessError;
  const shouldShowContent = !!displayPodcast;

  // OPTIMIZED: Use cached mutations for better performance
  const handleStartLearning = async () => {
    if (displayPodcast) {
      if (isPremium && !hasAccess) {
        console.log('🔒 Premium course without access - showing checkout');
        setShowCheckout(true);
        return;
      }

      // Use optimized progress update
      await updateProgressMutation.mutateAsync({
        courseId: displayPodcast.id,
        updates: {
          progress_percentage: 1,
          last_listened_at: new Date().toISOString(),
        }
      });
      
      // Scroll to the learning path section
      const learningPathElement = document.getElementById('learning-path-section');
      if (learningPathElement) {
        learningPathElement.scrollIntoView({ behavior: 'smooth' });
      }
      console.log('Started learning course:', displayPodcast.title);
    }
  };

  const handleToggleSave = async () => {
    if (displayPodcast) {
      await toggleSaveMutation.mutateAsync(displayPodcast.id);
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
    
    if (!canPlayLesson(lesson)) {
      console.log('🚫 Lesson is locked');
      return;
    }
    
    if (displayPodcast) {
      selectLesson(lesson, displayPodcast, true);
    }
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

  // Show content if we have valid data
  if (shouldShowContent) {
    console.log('✅ OPTIMIZED: RENDERING CONTENT with cached data:', {
      courseTitle: displayPodcast.title,
      isCurrentData: !!podcast,
      isStableReference: !podcast && !!lastValidPodcast.current,
      hasUserProgress: userProgress.length > 0,
      courseProgress: !!courseProgress,
      currentLesson: currentLesson?.title,
      isPlaying,
      performanceMode: 'OPTIMIZED'
    });

    return (
      <ErrorBoundary
        key={courseId} // Force remount on course change
        fallback={
          <DashboardLayout>
            <CourseErrorState
              error="Ha ocurrido un error inesperado."
              onRetry={handleRetry}
              onGoBack={handleGoBack}
            />
          </DashboardLayout>
        }
     >
        <DashboardLayout>
          <NotesProvider>
            <MetaTags
              title={`${displayPodcast.title} - Miyo`}
              description={displayPodcast.description}
              image={displayPodcast.imageUrl}
              url={`${window.location.origin}/dashboard/course/${courseId}`}
            />
            
            <div key={courseId} className="max-w-7xl mx-auto pb-8">
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
                lessonProgress={freshLessonProgress}
                showCheckout={showCheckout}
                onStartLearning={handleStartLearning}
                onToggleSave={handleToggleSave}
                onSelectLesson={handleLessonSelect}
                onShowCheckout={() => setShowCheckout(true)}
                onCloseCheckout={() => setShowCheckout(false)}
                onTogglePlay={togglePlay}
                onLessonComplete={onLessonComplete}
                onProgressUpdate={onProgressUpdate}
                onPurchaseComplete={handlePurchaseComplete}
              />
            </div>
          </NotesProvider>
        </DashboardLayout>
      </ErrorBoundary>
    );
  }

  // Show error state
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

  // Show course not found
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

  // Show loading with optimized skeleton
  console.log('🔄 OPTIMIZED: Showing loading state with cached fallback');
  return (
    <DashboardLayout>
      <CourseLoadingSkeleton loadingMessage="Cargando curso..." />
    </DashboardLayout>
  );
};

export default DashboardCourseOptimized;