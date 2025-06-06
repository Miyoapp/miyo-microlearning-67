
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
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';

const Course = () => {
  const { id } = useParams<{ id: string }>();
  const { podcast, setPodcast, isLoading } = useCourseData(id);
  const { 
    currentLesson, 
    isPlaying, 
    handleSelectLesson, 
    handleTogglePlay, 
    handleLessonComplete,
    handleProgressUpdate,
    initializePodcastWithProgress
  } = useConsolidatedLessons(podcast, setPodcast);
  
  // Initialize podcast when data is loaded
  useEffect(() => {
    if (podcast) {
      console.log('Course page: Podcast loaded, initializing...');
      initializePodcastWithProgress();
    }
  }, [podcast?.id, initializePodcastWithProgress]);
  
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
        onSelectLesson={handleSelectLesson}
      />
      <AudioPlayer 
        lesson={currentLesson}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onComplete={handleLessonComplete}
        onProgressUpdate={handleProgressUpdate}
      />
      <CourseFooter />
    </div>
  );
};

export default Course;
