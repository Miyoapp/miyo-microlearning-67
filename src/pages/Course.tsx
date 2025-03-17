
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AudioPlayer from '../components/AudioPlayer';
import { Podcast, Lesson, Module } from '../types';
import { getPodcastById } from '../data/podcasts';
import CourseHero from '../components/course/CourseHero';
import CourseContent from '../components/course/CourseContent';
import CourseFooter from '../components/course/CourseFooter';

const Course = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch podcast data
  useEffect(() => {
    if (id) {
      const podcastData = getPodcastById(id);
      
      if (podcastData) {
        // Generate modules if they don't exist
        if (!podcastData.modules || podcastData.modules.length === 0) {
          const defaultModules: Module[] = [
            {
              id: 'module-1',
              title: 'Conceptos Básicos',
              lessonIds: podcastData.lessons.slice(0, 2).map(l => l.id)
            },
            {
              id: 'module-2',
              title: 'Técnicas Intermedias',
              lessonIds: podcastData.lessons.slice(2, 4).map(l => l.id)
            },
            {
              id: 'module-3',
              title: 'Aplicación Práctica',
              lessonIds: podcastData.lessons.slice(4).map(l => l.id)
            }
          ];
          
          podcastData.modules = defaultModules;
        }
        
        setPodcast(podcastData);
        
        // Set first unlocked lesson as current
        const firstAvailableLesson = podcastData.lessons.find(lesson => !lesson.isLocked);
        if (firstAvailableLesson) {
          setCurrentLesson(firstAvailableLesson);
        }
      }
      
      // Simulate loading
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [id]);
  
  // Handle selecting a lesson
  const handleSelectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };
  
  // Handle lesson completion
  const handleLessonComplete = () => {
    if (!podcast || !currentLesson) return;
    
    // Mark current lesson as completed
    const updatedLessons = podcast.lessons.map(lesson => {
      if (lesson.id === currentLesson.id) {
        return { ...lesson, isCompleted: true };
      }
      return lesson;
    });
    
    // Find the next lesson index
    const currentIndex = updatedLessons.findIndex(lesson => lesson.id === currentLesson.id);
    const nextIndex = currentIndex + 1;
    
    // Unlock the next lesson if it exists
    if (nextIndex < updatedLessons.length) {
      updatedLessons[nextIndex].isLocked = false;
    }
    
    // Update podcast with new lesson states
    setPodcast({ ...podcast, lessons: updatedLessons });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <div className="w-16 h-16 rounded-full bg-miyo-200"></div>
        </div>
      </div>
    );
  }
  
  if (!podcast) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">Course not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-miyo-800 text-white rounded-full"
        >
          Go back to home
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />
      <CourseHero podcast={podcast} />
      <CourseContent 
        podcast={podcast}
        currentLessonId={currentLesson?.id || null}
        onSelectLesson={handleSelectLesson}
      />
      <AudioPlayer 
        lesson={currentLesson}
        onComplete={handleLessonComplete}
      />
      <CourseFooter />
    </div>
  );
};

export default Course;
