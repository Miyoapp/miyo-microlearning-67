
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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, AlertCircle } from 'lucide-react';

const DashboardCourse = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { podcast, setPodcast, isLoading: courseLoading, error: courseError, retry: retryCourse } = useCourseData(courseId);
  const { userProgress, loading: progressLoading, refetch } = useUserProgress();
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
  
  // CRITICAL FIX: Handle empty arrays properly - don't treat them as loading states
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
  
  // CRITICAL FIX: Only show loading when actually loading, not when data is empty
  const isDataLoading = courseLoading || accessLoading;
  const isProgressStillLoading = progressLoading && !userProgress; // Only loading if we don't have ANY progress data yet

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

  // CRITICAL FIX: Show skeleton loading only when data is actually loading
  if (isDataLoading || isProgressStillLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto pb-20 sm:pb-24">
          <div className="p-4 sm:p-0">
            <div className="space-y-6">
              {/* Header skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              
              {/* Course info skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Skeleton className="h-48 w-full sm:w-48 rounded-lg" />
                    <div className="flex-1 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Learning path skeleton */}
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <div className="text-sm text-gray-500">
              {courseLoading ? 'Cargando curso...' : 
               accessLoading ? 'Verificando acceso...' : 
               'Cargando progreso...'}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state: show error with retry option
  if (hasError) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Error al cargar el curso
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {courseError || accessError || 'Ha ocurrido un error inesperado.'}
          </p>
          <Button onClick={handleRetry} className="mr-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar de nuevo
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Course not found state
  if (!podcast) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Curso no encontrado</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            El curso que buscas no existe o no está disponible.
          </p>
          <p className="text-xs text-gray-500 mb-6">ID del curso: {courseId}</p>
          <Button onClick={handleRetry} className="mr-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Buscar de nuevo
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // CRITICAL FIX: Always render the course content even if userProgress is empty
  // Empty userProgress array is normal for new users and should not prevent rendering
  console.log('✅ Rendering course content:', {
    courseTitle: podcast.title,
    hasUserProgress: userProgress.length > 0,
    courseProgress: !!courseProgress,
    isPremium,
    hasAccess
  });

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
