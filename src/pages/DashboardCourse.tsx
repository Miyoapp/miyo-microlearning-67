
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useCourseData } from '@/hooks/useCourseData';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useLessons } from '@/hooks/useLessons';
import { useCourseRealtimeSync } from '@/hooks/course/useCourseRealtimeSync';
import { useCourseAccess } from '@/hooks/course/useCourseAccess';
import CoursePageHeader from '@/components/course/CoursePageHeader';
import CourseLoadingSkeleton from '@/components/course/CourseLoadingSkeleton';
import CourseErrorState from '@/components/course/CourseErrorState';
import CourseNotFoundState from '@/components/course/CourseNotFoundState';
import CourseAccessHandler from '@/components/course/CourseAccessHandler';
import MetaTags from '@/components/MetaTags';
import { NotesProvider } from '@/contexts/NotesContext';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

const DashboardCourse = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { podcast, setPodcast, isLoading: courseLoading, error: courseError, retry: retryCourse } = useCourseData(courseId);
  const { userProgress, loading: progressLoading, refetch, startCourse, toggleSaveCourse } = useUserProgress();
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
  
  // Enhanced stable reference with timeout-based cleanup
  const lastValidPodcast = useRef(podcast);
  const podcastClearTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Track component lifecycle
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
      console.log('📊 DashboardCourse: Updating fresh lesson progress', rawLessonProgress.length);
      setFreshLessonProgress([...rawLessonProgress]);
    }
  }, [rawLessonProgress]);
  
  // Refresh lessons progress when needed
  const refreshLessonsProgress = useCallback(async () => {
    if (podcast) {
      console.log('🔄 DashboardCourse: Refreshing lessons progress');
      const updatedProgress = await calculateLessonStates();
      
      // Force immediate UI update
      if (updatedProgress) {
        console.log('🔄 DashboardCourse: Force updating fresh progress');
        setFreshLessonProgress([...updatedProgress]);
      }
      console.log('✅ DashboardCourse: Lessons progress refresh complete');
    }
  }, [podcast, calculateLessonStates]);

  // Connect lessons refresh callback to audio player
  useEffect(() => {
    setOnLessonCompletedCallback(() => refreshLessonsProgress);
    return () => setOnLessonCompletedCallback(null);
  }, [refreshLessonsProgress, setOnLessonCompletedCallback]);
  
  // Set up realtime sync - simplified without circular dependencies
  useCourseRealtimeSync({
    podcast,
    refetch,
    onProgressUpdate: refreshLessonsProgress
  });
  
  // Course progress calculations
  const courseProgress = userProgress.find(p => p.course_id === courseId) || null;
  const isSaved = courseProgress?.is_saved || false;
  const hasStarted = (courseProgress?.progress_percentage || 0) > 0;
  const progressPercentage = courseProgress?.progress_percentage || 0;
  const isCompleted = courseProgress?.is_completed || false;
  const isReviewMode = isCompleted && progressPercentage === 100;

  // Display podcast with stable fallback
  const displayPodcast = podcast || lastValidPodcast.current;

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

  console.log('🔒 DASHBOARD COURSE STATE:', {
    shouldShowContent: !!displayPodcast,
    isActuallyLoading: !displayPodcast && (courseLoading || progressLoading),
    hasError: !!(courseError || accessError),
    displayPodcastValid: !!displayPodcast,
    courseTitle: displayPodcast?.title,
    currentLesson: currentLesson?.title,
    isPlaying,
    lessonsCount: lessonsWithProgress.length
  });

  const isActuallyLoading = !displayPodcast && (courseLoading || progressLoading);
  const hasError = courseError || accessError;
  const shouldShowContent = !!displayPodcast;

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
    console.log('✅ RENDERING CONTENT with new audio system:', {
      courseTitle: displayPodcast.title,
      isCurrentData: !!podcast,
      isStableReference: !podcast && !!lastValidPodcast.current,
      hasUserProgress: userProgress.length > 0,
      courseProgress: !!courseProgress,
      currentLesson: currentLesson?.title,
      isPlaying
    });

    return (
      <DashboardLayout>
        <NotesProvider>
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

  // Show loading
  console.log('🔄 Showing loading state');
  return (
    <DashboardLayout>
      <CourseLoadingSkeleton loadingMessage="Cargando curso..." />
    </DashboardLayout>
  );
};

export default DashboardCourse;
