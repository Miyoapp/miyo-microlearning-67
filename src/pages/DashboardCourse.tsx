
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourseData } from '@/hooks/useCourseData';
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CourseAccessHandler from '@/components/course/CourseAccessHandler';
import CourseLoading from '@/components/course/CourseLoading';
import CourseNotFound from '@/components/course/CourseNotFound';
import CourseErrorState from '@/components/course/CourseErrorState';
import MetaTags from '@/components/MetaTags';

const DashboardCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
    podcast,
    userProgress,
    isPending: courseLoading,
    isError: courseError,
    error
  } = useCourseData(id);

  const consolidatedData = useConsolidatedLessons({
    podcast,
    userProgress,
    enabled: !!podcast && !!userProgress
  });

  // Loading state
  if (courseLoading || consolidatedData.isLoading) {
    return (
      <DashboardLayout>
        <CourseLoading />
      </DashboardLayout>
    );
  }

  // Error states
  if (courseError) {
    console.error('Course error:', error);
    return (
      <DashboardLayout>
        <CourseErrorState error={error} />
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

  if (consolidatedData.error) {
    return (
      <DashboardLayout>
        <CourseErrorState error={consolidatedData.error} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <MetaTags
        title={`${podcast.title} - Aprendizaje Interactivo`}
        description={podcast.description}
        image={podcast.imageUrl}
      />
      
      <div className="pb-4 lg:pb-8">
        <CourseAccessHandler
          podcast={podcast}
          currentLesson={consolidatedData.currentLesson}
          hasStarted={consolidatedData.hasStarted}
          isSaved={consolidatedData.isSaved}
          progressPercentage={consolidatedData.progressPercentage}
          isCompleted={consolidatedData.isCompleted}
          isPremium={consolidatedData.isPremium}
          hasAccess={consolidatedData.hasAccess}
          isPlaying={consolidatedData.isPlaying}
          showCheckout={consolidatedData.showCheckout}
          onStartLearning={consolidatedData.handleStartLearning}
          onToggleSave={consolidatedData.handleToggleSave}
          onSelectLesson={consolidatedData.handleSelectLesson}
          onShowCheckout={consolidatedData.handleShowCheckout}
          onCloseCheckout={consolidatedData.handleCloseCheckout}
          onTogglePlay={consolidatedData.handleTogglePlay}
          onLessonComplete={consolidatedData.handleLessonComplete}
          onProgressUpdate={consolidatedData.handleProgressUpdate}
          onPurchaseComplete={consolidatedData.handlePurchaseComplete}
        />
      </div>
    </DashboardLayout>
  );
};

export default DashboardCourse;
