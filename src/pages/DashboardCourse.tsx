
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourseData } from '@/hooks/useCourseData';
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';
import { useUserProgress } from '@/hooks/useUserProgress';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CourseAccessHandler from '@/components/course/CourseAccessHandler';
import CourseLoading from '@/components/course/CourseLoading';
import CourseNotFound from '@/components/course/CourseNotFound';
import CourseErrorState from '@/components/course/CourseErrorState';
import MetaTags from '@/components/MetaTags';
import { useNavigate } from 'react-router-dom';

const DashboardCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    podcast,
    setPodcast,
    isLoading: courseLoading,
    error: courseError,
    retry
  } = useCourseData(id);

  const { userProgress } = useUserProgress();

  const consolidatedData = useConsolidatedLessons(podcast, setPodcast);

  // Loading state
  if (courseLoading || !podcast) {
    return (
      <DashboardLayout>
        <CourseLoading />
      </DashboardLayout>
    );
  }

  // Error state
  if (courseError) {
    console.error('Course error:', courseError);
    return (
      <DashboardLayout>
        <CourseErrorState 
          error={courseError} 
          onRetry={retry}
          onGoBack={() => navigate('/dashboard')}
        />
      </DashboardLayout>
    );
  }

  if (!podcast) {
    return (
      <DashboardLayout>
        <CourseNotFound />
      </DashboardLayout>
    );
  }

  // Calculate derived data
  const courseProgress = userProgress.find(p => p.course_id === podcast.id);
  const progressPercentage = courseProgress?.progress_percentage || 0;
  const hasStarted = progressPercentage > 0;
  const isSaved = courseProgress?.is_saved || false;
  const isCompleted = progressPercentage >= 100;
  const isPremium = podcast.tipo_curso === 'pago';
  
  // Mock handlers for now - these should come from a proper hook
  const handleStartLearning = () => {
    // Implementation would go here
    console.log('Start learning clicked');
  };

  const handleToggleSave = () => {
    // Implementation would go here
    console.log('Toggle save clicked');
  };

  const handleShowCheckout = () => {
    // Implementation would go here
    console.log('Show checkout clicked');
  };

  const handleCloseCheckout = () => {
    // Implementation would go here
    console.log('Close checkout clicked');
  };

  const handlePurchaseComplete = () => {
    // Implementation would go here
    console.log('Purchase complete');
  };

  return (
    <DashboardLayout>
      <MetaTags
        title={`${podcast.title} - Aprendizaje Interactivo`}
        description={podcast.description}
        image={podcast.imageUrl}
      />
      
      <div className="pb-2 lg:pb-8">
        <CourseAccessHandler
          podcast={podcast}
          currentLesson={consolidatedData.currentLesson}
          hasStarted={hasStarted}
          isSaved={isSaved}
          progressPercentage={progressPercentage}
          isCompleted={isCompleted}
          isPremium={isPremium}
          hasAccess={!isPremium} // Simplified for now
          isPlaying={consolidatedData.isPlaying}
          showCheckout={false} // Simplified for now
          onStartLearning={handleStartLearning}
          onToggleSave={handleToggleSave}
          onSelectLesson={consolidatedData.handleSelectLesson}
          onShowCheckout={handleShowCheckout}
          onCloseCheckout={handleCloseCheckout}
          onTogglePlay={consolidatedData.handleTogglePlay}
          onLessonComplete={consolidatedData.handleLessonComplete}
          onProgressUpdate={consolidatedData.handleProgressUpdate}
          onPurchaseComplete={handlePurchaseComplete}
        />
      </div>
    </DashboardLayout>
  );
};

export default DashboardCourse;
