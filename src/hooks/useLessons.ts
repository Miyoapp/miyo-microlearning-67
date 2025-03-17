
import { Podcast, Lesson } from '@/types';
import { useLessonSelection } from './lessons/useLessonSelection';
import { useLessonPlayback } from './lessons/useLessonPlayback';
import { useLessonProgress } from './lessons/useLessonProgress';

export function useLessons(podcast: Podcast | null, setPodcast: (podcast: Podcast) => void) {
  // Use our individual hooks
  const {
    currentLesson,
    setCurrentLesson,
    initializeCurrentLesson,
    handleSelectLesson
  } = useLessonSelection(podcast);
  
  const {
    isPlaying,
    setIsPlaying,
    handleTogglePlay,
    advanceToNextLesson
  } = useLessonPlayback({ 
    currentLesson, 
    podcast 
  });
  
  const { handleLessonComplete } = useLessonProgress(podcast, setPodcast, currentLesson);
  
  // Wrapper for handleSelectLesson to include isPlaying
  const selectLesson = (lesson: Lesson) => {
    // If selecting the same lesson that's already playing, just toggle play/pause
    if (currentLesson && lesson.id === currentLesson.id) {
      handleTogglePlay();
      return;
    }
    
    handleSelectLesson(lesson, setIsPlaying);
  };
  
  // Wrapper for advanceToNextLesson that passes the setCurrentLesson callback
  const advanceToNextLessonWrapper = () => {
    console.log("Wrapper for advanceToNextLesson called");
    advanceToNextLesson((nextLesson) => {
      console.log("Setting next lesson:", nextLesson.title);
      setCurrentLesson(nextLesson);
    });
  };

  return {
    currentLesson,
    setCurrentLesson,
    isPlaying,
    setIsPlaying,
    initializeCurrentLesson,
    handleSelectLesson: selectLesson,
    handleTogglePlay,
    handleLessonComplete,
    advanceToNextLesson: advanceToNextLessonWrapper
  };
}
