
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useCourseDataSimplified } from '@/hooks/useCourseDataSimplified';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';
import { useRealtimeManager } from '@/hooks/useRealtimeManager';
import CoursePageHeader from '@/components/course/CoursePageHeader';
import CourseMainContent from '@/components/course/CourseMainContent';
import CourseErrorBoundary from '@/components/course/CourseErrorBoundary';
import CourseLoadingDetailed from '@/components/course/CourseLoadingDetailed';
import AudioPlayer from '@/components/AudioPlayer';
import CheckoutModal from '@/components/course/CheckoutModal';

const DashboardCourse = () => {
  const { courseId } = useParams<{ courseId: string }>();
  
  console.log(`🎭 [DashboardCourse] RENDER - courseId: ${courseId}`);
  
  // Hook simplificado que maneja todo con mejor debugging
  const { 
    podcast, 
    setPodcast, 
    isLoading, 
    isPremium, 
    hasAccess, 
    refetchPurchases,
    errorState,
    loadingState
  } = useCourseDataSimplified(courseId);
  
  const { userProgress, toggleSaveCourse, startCourse, refetch: refetchUserProgress } = useUserProgress();
  const [showCheckout, setShowCheckout] = useState(false);
  
  console.log(`🎭 [DashboardCourse] State:`, {
    courseId,
    isLoading,
    hasErrors: !!(errorState.course || errorState.purchases),
    podcast: !!podcast,
    courseTitle: podcast?.title,
    isPremium,
    hasAccess
  });

  // Use consolidated lessons hook - pero solo después de tener el curso
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
  
  const courseProgress = userProgress.find(p => p.course_id === courseId);
  const isSaved = courseProgress?.is_saved || false;
  const hasStarted = (courseProgress?.progress_percentage || 0) > 0;
  const progressPercentage = courseProgress?.progress_percentage || 0;
  const isCompleted = courseProgress?.is_completed || false;
  const isReviewMode = isCompleted && progressPercentage === 100;

  const handleStartLearning = async () => {
    if (podcast) {
      if (isPremium && !hasAccess) {
        console.log('🔒 [DashboardCourse] Premium course without access - showing checkout');
        setShowCheckout(true);
        return;
      }

      await startCourse(podcast.id);
      await refetchUserProgress();
      
      // Scroll to the learning path section
      const learningPathElement = document.getElementById('learning-path-section');
      if (learningPathElement) {
        learningPathElement.scrollIntoView({ behavior: 'smooth' });
      }
      console.log('✅ [DashboardCourse] Started learning course:', podcast.title);
    }
  };

  const handleToggleSave = () => {
    if (podcast) {
      toggleSaveCourse(podcast.id);
    }
  };

  const handlePurchaseComplete = () => {
    console.log('🎉 [DashboardCourse] Purchase completed, refetching purchases...');
    refetchPurchases();
  };

  const handleLessonSelect = (lesson: any) => {
    // Check if user has access to this lesson
    if (isPremium && !hasAccess) {
      console.log('🔒 [DashboardCourse] Lesson access denied - showing checkout');
      setShowCheckout(true);
      return;
    }
    
    handleSelectLesson(lesson, true);
  };

  const handleRetry = () => {
    console.log('🔄 [DashboardCourse] Retrying course load...');
    window.location.reload();
  };

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

export default DashboardCourse;
