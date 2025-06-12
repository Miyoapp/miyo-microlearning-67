import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useCourseData } from '@/hooks/useCourseData';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';
import { useCourseRealtimeSync } from '@/hooks/course/useCourseRealtimeSync';
import { useCourseAccess } from '@/hooks/course/useCourseAccess';
import { useRealtimeProgress } from '@/hooks/useRealtimeProgress';
import CoursePageHeader from '@/components/course/CoursePageHeader';
import CourseMainContent from '@/components/course/CourseMainContent';
import AudioPlayer from '@/components/AudioPlayer';
import CheckoutModal from '@/components/course/CheckoutModal';

const DashboardCourse = () => {
  const { id } = useParams<{ id: string }>();
  const { podcast, setPodcast, isLoading, error } = useCourseData(id);
  const { userProgress, toggleSaveCourse, startCourse, refetch } = useUserProgress();
  const [showCheckout, setShowCheckout] = useState(false);
  
  console.log('🎯 DashboardCourse render state:', {
    courseId: id,
    isLoading,
    error,
    hasPodcast: !!podcast,
    podcastTitle: podcast?.title
  });
  
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
  
  // Course access and premium status
  const { isPremium, hasAccess, refetchPurchases } = useCourseAccess(podcast);
  
  // Set up realtime sync
  useCourseRealtimeSync({
    podcast,
    initializePodcastWithProgress,
    refetch
  });

  // Set up realtime progress updates for the CourseStats table
  useRealtimeProgress({
    onCourseProgressUpdate: () => {
      console.log('🔄 Real-time course progress update detected, refreshing Tu progreso table');
      refetch(); // This will update the userProgress state
    }
  });
  
  const courseProgress = userProgress.find(p => p.course_id === id);
  const isSaved = courseProgress?.is_saved || false;
  const hasStarted = (courseProgress?.progress_percentage || 0) > 0;
  const progressPercentage = courseProgress?.progress_percentage || 0;
  const isCompleted = courseProgress?.is_completed || false;
  const isReviewMode = isCompleted && progressPercentage === 100;

  // CRITICAL DEBUG: Log audio player visibility conditions
  console.log('🎵 AUDIO PLAYER VISIBILITY DEBUG:', {
    hasCurrentLesson: !!currentLesson,
    currentLessonTitle: currentLesson?.title,
    hasAccess,
    isPremium,
    shouldShow: !!currentLesson && hasAccess,
    courseId: id
  });

  const handleStartLearning = async () => {
    if (podcast) {
      if (isPremium && !hasAccess) {
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
    refetchPurchases();
  };

  const handleLessonSelect = (lesson: any) => {
    // Check if user has access to this lesson
    if (isPremium && !hasAccess) {
      setShowCheckout(true);
      return;
    }
    
    // Use manual selection flag to prevent auto-play interference
    handleSelectLesson(lesson, true);
  };

  // Enhanced lesson complete handler with real-time progress trigger
  const handleLessonCompleteEnhanced = async () => {
    console.log('🏁 Enhanced lesson complete handler triggered');
    
    // Execute the existing lesson completion logic
    await handleLessonComplete();
    
    // Trigger immediate progress refresh to update CourseStats
    setTimeout(() => {
      console.log('🔄 Triggering progress refresh after lesson completion');
      refetch();
    }, 500); // Small delay to ensure DB updates are complete
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-gray-600">Cargando curso...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Error al cargar curso</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">ID del curso: {id}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!podcast) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Curso no encontrado</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">El curso que buscas no existe o no está disponible.</p>
          <p className="text-sm text-gray-500">ID del curso: {id}</p>
        </div>
      </DashboardLayout>
    );
  }

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
      
      {/* Always show audio player when there's a current lesson and user has access */}
      {currentLesson && hasAccess && (
        <AudioPlayer 
          lesson={currentLesson}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onComplete={handleLessonCompleteEnhanced}
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
