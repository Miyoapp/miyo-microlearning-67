
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
    console.log("Wrapper for advanceToNextLesson called - advancing from:", currentLesson?.title);
    
    // Get the next lesson using the callback approach to ensure it happens
    advanceToNextLesson((nextLesson) => {
      if (nextLesson) {
        console.log("Setting next lesson:", nextLesson.title);
        setCurrentLesson(nextLesson);
        
        // Ensure the UI updates by forcing the isPlaying state after a brief moment
        setTimeout(() => {
          setIsPlaying(true);
        }, 300);
      } else {
        console.log("No next lesson available to advance to");
      }
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
