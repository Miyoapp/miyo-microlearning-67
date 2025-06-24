
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useCourseData } from '@/hooks/useCourseData';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';
import { useCourseRealtimeSync } from '@/hooks/course/useCourseRealtimeSync';
import { useCourseAccess } from '@/hooks/course/useCourseAccess';
import CoursePageHeader from '@/components/course/CoursePageHeader';
import CourseMainContent from '@/components/course/CourseMainContent';
import AudioPlayer from '@/components/AudioPlayer';
import CheckoutModal from '@/components/course/CheckoutModal';

const DashboardCourse = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { podcast, setPodcast, isLoading: courseLoading } = useCourseData(courseId);
  const { userProgress, toggleSaveCourse, startCourse, refetch } = useUserProgress();
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Course access and premium status
  const { isPremium, hasAccess, isLoading: accessLoading, refetchPurchases } = useCourseAccess(podcast);
  
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
  
  const courseProgress = userProgress.find(p => p.course_id === courseId);
  const isSaved = courseProgress?.is_saved || false;
  const hasStarted = (courseProgress?.progress_percentage || 0) > 0;
  const progressPercentage = courseProgress?.progress_percentage || 0;
  const isCompleted = courseProgress?.is_completed || false;
  const isReviewMode = isCompleted && progressPercentage === 100;

  // CRITICAL DEBUG: Log access state
  console.log('🎭 DASHBOARD COURSE ACCESS STATE:', {
    courseId,
    courseLoading,
    accessLoading,
    isPremium,
    hasAccess,
    podcast: !!podcast,
    courseTitle: podcast?.title
  });

  // Loading state: show loading while course or access is loading
  const isLoading = courseLoading || accessLoading;

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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-gray-600">
            {courseLoading ? 'Cargando curso...' : 'Verificando acceso...'}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!podcast) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Curso no encontrado</h2>
          <p className="text-sm sm:text-base text-gray-600">
            El curso que buscas no existe o no está disponible.
          </p>
          <p className="text-xs text-gray-500 mt-2">ID del curso: {courseId}</p>
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
