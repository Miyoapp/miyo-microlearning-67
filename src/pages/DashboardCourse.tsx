
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Play } from 'lucide-react';
import { useCourseData } from '@/hooks/useCourseData';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';
import { formatMinutesToHumanReadable } from '@/lib/formatters';
import CourseStats from '@/components/course/CourseStats';
import LearningPath from '@/components/LearningPath';
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
              {/* Course Header */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
                <div className="aspect-[3/1] relative">
                  <img 
                    src={podcast.imageUrl} 
                    alt={podcast.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <img 
                      src={podcast.creator.imageUrl} 
                      alt={podcast.creator.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{podcast.creator.name}</div>
                      <div className="text-sm text-gray-500">{podcast.category.nombre}</div>
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{podcast.title}</h1>
                  <p className="text-gray-600 mb-6">{podcast.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <span>{formatMinutesToHumanReadable(podcast.duration)}</span>
                    <span>{podcast.lessonCount} lecciones</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Button 
                      className="bg-miyo-800 hover:bg-miyo-900 flex items-center space-x-2"
                      onClick={handleStartLearning}
                    >
                      <Play className="w-4 h-4" />
                      <span>{hasStarted ? 'Continuar aprendiendo' : 'Comenzar a aprender'}</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => toggleSaveCourse(podcast.id)}
                      className="flex items-center space-x-2"
                    >
                      {isSaved ? 
                        <BookmarkCheck className="w-4 h-4 text-miyo-800" /> : 
                        <Bookmark className="w-4 h-4" />
                      }
                      <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Learning Path */}
              <div id="learning-path-section" className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Ruta de aprendizaje</h2>
                <LearningPath 
                  lessons={podcast.lessons}
                  modules={podcast.modules}
                  onSelectLesson={handleSelectLesson}
                  currentLessonId={currentLesson?.id || null}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <CourseStats podcast={podcast} />
            </div>
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
