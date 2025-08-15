
import React from 'react';
import { useParams } from 'react-router-dom';
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';
import CourseHero from '@/components/course/CourseHero';
import CourseSidebar from '@/components/course/CourseSidebar';
import CourseLearningPathSection from '@/components/course/CourseLearningPathSection';
import CourseNotFound from '@/components/course/CourseNotFound';
import CoursePageHeader from '@/components/course/CoursePageHeader';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const DashboardCourse = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const {
    podcast,
    currentLesson,
    isPlaying,
    isLoading,
    error,
    handleSelectLesson,
    handleLessonComplete,
    handleProgressUpdate
  } = useConsolidatedLessons(courseId);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="miyo-container py-8">
            <div className="text-center text-gray-500">Cargando curso...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="miyo-container py-8">
            <div className="text-center text-red-500">Error al cargar el curso.</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!podcast) {
    return <CourseNotFound />;
  }

  const handleLessonCompleteWrapper = (lessonId: string) => {
    console.log('📚 Lesson completed:', lessonId);
    handleLessonComplete();
  };

  const handleProgressUpdateWrapper = (lessonId: string, position: number) => {
    console.log('📊 Progress update:', lessonId, position);
    handleProgressUpdate(position);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <CoursePageHeader />
        
        <main className="miyo-container py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <CourseHero podcast={podcast} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <CourseLearningPathSection
                  podcast={podcast}
                  currentLessonId={currentLesson?.id || null}
                  onSelectLesson={handleSelectLesson}
                  onLessonComplete={handleLessonCompleteWrapper}
                  onProgressUpdate={handleProgressUpdateWrapper}
                />
              </div>
              
              <div className="space-y-6">
                <CourseSidebar podcast={podcast} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default DashboardCourse;
