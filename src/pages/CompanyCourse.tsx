import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourseData } from '@/hooks/useCourseData';
import CourseHero from '@/components/course/CourseHero';
import CourseLearningPathSection from '@/components/course/CourseLearningPathSection';
import CourseSidebar from '@/components/course/CourseSidebar';
import CourseNotFound from '@/components/course/CourseNotFound';
import Header from '@/components/Header';

const CompanyCourse = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const {
    podcast,
    isPodcastLoading,
    podcastError,
    currentLesson,
    isPlaying,
    handleSelectLesson,
    handleLessonComplete,
    handleProgressUpdate
  } = useCourseData(courseId);

  if (isPodcastLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  if (podcastError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {podcastError.message}
      </div>
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
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
        </main>
      </div>
    </div>
  );
};

export default CompanyCourse;
