
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useCourseData } from '@/hooks/useCourseData';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';
import CourseHeader from '@/components/course/CourseHeader';
import CourseLearningPathSection from '@/components/course/CourseLearningPathSection';
import CourseSidebar from '@/components/course/CourseSidebar';
import AudioPlayer from '@/components/AudioPlayer';

const DashboardCourse = () => {
  const { id } = useParams<{ id: string }>();
  const { podcast, setPodcast, isLoading } = useCourseData(id);
  const { userProgress, toggleSaveCourse, startCourse, refetch } = useUserProgress();
  
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
  
  const courseProgress = userProgress.find(p => p.course_id === id);
  const isSaved = courseProgress?.is_saved || false;
  const hasStarted = (courseProgress?.progress_percentage || 0) > 0;
  const progressPercentage = courseProgress?.progress_percentage || 0;
  const isCompleted = courseProgress?.is_completed || false;

  // Initialize podcast and current lesson when data is loaded
  useEffect(() => {
    if (podcast) {
      console.log('Podcast loaded, initializing...');
      initializePodcastWithProgress();
    }
  }, [podcast?.id, initializePodcastWithProgress]);

  const handleStartLearning = async () => {
    if (podcast) {
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-gray-600">Cargando curso...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!podcast) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Curso no encontrado</h2>
          <p className="text-gray-600">El curso que buscas no existe o no está disponible.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <CourseHeader
                podcast={podcast}
                hasStarted={hasStarted}
                isSaved={isSaved}
                onStartLearning={handleStartLearning}
                onToggleSave={handleToggleSave}
              />

              <CourseLearningPathSection
                podcast={podcast}
                currentLessonId={currentLesson?.id || null}
                onSelectLesson={handleSelectLesson}
              />
            </div>

            {/* Sidebar */}
            <CourseSidebar 
              podcast={podcast}
              progressPercentage={progressPercentage}
              isCompleted={isCompleted}
            />
          </div>
        </div>
      </DashboardLayout>
      
      {/* Audio Player - Fixed at bottom */}
      <AudioPlayer 
        lesson={currentLesson}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onComplete={handleLessonComplete}
        onProgressUpdate={handleProgressUpdate}
      />
    </>
  );
};

export default DashboardCourse;
