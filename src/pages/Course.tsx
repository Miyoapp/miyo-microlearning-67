
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
  console.log('📍 Course page loaded with ID:', id);
  
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
      console.log('📚 Course page: Podcast loaded, initializing...', podcast.title);
      initializePodcastWithProgress();
    }
  }, [podcast?.id, initializePodcastWithProgress]);
  
  console.log('🎬 Course render state:', {
    isLoading,
    hasPodcast: !!podcast,
    podcastTitle: podcast?.title,
    hasCurrentLesson: !!currentLesson,
    currentLessonTitle: currentLesson?.title
  });
  
  if (isLoading) {
    console.log('⏳ Showing loading state');
    return <CourseLoading />;
  }
  
  if (!podcast) {
    console.log('❌ No podcast found, showing not found page');
    return <CourseNotFound />;
  }
  
  console.log('✅ Rendering course:', podcast.title);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />
      <CourseHero podcast={podcast} />
      <CourseContent 
        podcast={podcast}
        currentLessonId={currentLesson?.id || null}
        onSelectLesson={handleSelectLesson}
      />
      {currentLesson && (
        <AudioPlayer 
          lesson={currentLesson}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onComplete={handleLessonComplete}
          onProgressUpdate={handleProgressUpdate}
        />
      )}
      <CourseFooter />
    </div>
  );
};

export default Course;
