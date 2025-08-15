
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import AudioPlayer from '../components/AudioPlayer';
import CourseHero from '../components/course/CourseHero';
import CourseContent from '../components/course/CourseContent';
import CourseFooter from '../components/course/CourseFooter';
import CourseLoading from '../components/course/CourseLoading';
import CourseNotFound from '../components/course/CourseNotFound';
import { useCourseData } from '@/hooks/useCourseData';
import { useLessons } from '@/hooks/useLessons';

const CompanyCourse = () => {
  const { id } = useParams<{ id: string }>();
  const { podcast, setPodcast, isLoading } = useCourseData(id);
  const { 
    currentLesson, 
    isPlaying, 
    initializeCurrentLesson,
    handleSelectLesson, 
    handleTogglePlay, 
    handleLessonComplete,
    advanceToNextLesson
  } = useLessons(podcast, setPodcast);
  
  // Set initial lesson once podcast data is loaded
  useEffect(() => {
    if (podcast) {
      initializeCurrentLesson();
    }
  }, [podcast, initializeCurrentLesson]);
  
  // Listen for lesson ended event to advance to next lesson
  useEffect(() => {
    const handleLessonEnded = (e: Event) => {
      const event = e as CustomEvent;
      console.log("Lesson ended event received:", event.detail);
      
      if (event.detail && event.detail.lessonId === currentLesson?.id) {
        console.log("Confirmed current lesson ended, advancing to next");
        
        // Mark current lesson as complete first
        handleLessonComplete();
        
        // Then advance to next lesson immediately
        setTimeout(() => {
          advanceToNextLesson();
        }, 100); // Very short delay to ensure completion state is saved first
      }
    };
    
    window.addEventListener('lessonEnded', handleLessonEnded);
    
    return () => {
      window.removeEventListener('lessonEnded', handleLessonEnded);
    };
  }, [currentLesson, advanceToNextLesson, handleLessonComplete]);
  
  if (isLoading) {
    return <CourseLoading />;
  }
  
  if (!podcast) {
    return <CourseNotFound />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />
      <CourseHero podcast={podcast} />
      <CourseContent 
        podcast={podcast}
        currentLessonId={currentLesson?.id || null}
        isGloballyPlaying={isPlaying}
        onSelectLesson={handleSelectLesson}
      />
      <AudioPlayer 
        lesson={currentLesson}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onComplete={handleLessonComplete}
      />
      <CourseFooter />
    </div>
  );
};

export default CompanyCourse;
