
import { Podcast, Lesson } from '@/types';
import { useLessonSelection } from './lessons/useLessonSelection';
import { useLessonPlayback } from './lessons/useLessonPlayback';
import { useLessonProgress } from './lessons/useLessonProgress';
import { useUserLessonProgress } from './useUserLessonProgress';
import { useCallback } from 'react';

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
  
  // Add user lesson progress tracking
  const { 
    markLessonComplete: markLessonCompleteInDB, 
    updateLessonPosition 
  } = useUserLessonProgress();
  
  // Enhanced lesson complete handler
  const handleLessonCompleteEnhanced = useCallback(() => {
    if (!currentLesson || !podcast) return;
    
    console.log('Handling lesson complete for:', currentLesson.title);
    
    // Mark as complete in local state (updates UI)
    handleLessonComplete();
    
    // Mark as complete in database
    markLessonCompleteInDB(currentLesson.id, podcast.id);
  }, [currentLesson, podcast, handleLessonComplete, markLessonCompleteInDB]);
  
  // Handle progress updates during playback
  const handleProgressUpdate = useCallback((position: number) => {
    if (!currentLesson || !podcast) return;
    
    // Only update position if not completed and position > 5% to avoid spam
    if (position > 5) {
      updateLessonPosition(currentLesson.id, podcast.id, position);
    }
  }, [currentLesson, podcast, updateLessonPosition]);
  
  // Wrapper for handleSelectLesson to include isPlaying and progress tracking
  const selectLesson = useCallback((lesson: Lesson) => {
    // If selecting the same lesson that's already playing, just toggle play/pause
    if (currentLesson && lesson.id === currentLesson.id) {
      handleTogglePlay();
      return;
    }
    
    handleSelectLesson(lesson, setIsPlaying);
    
    // Track lesson start in database
    if (podcast) {
      updateLessonPosition(lesson.id, podcast.id, 1); // Mark as started
    }
  }, [currentLesson, handleTogglePlay, handleSelectLesson, setIsPlaying, podcast, updateLessonPosition]);
  
  // Wrapper for advanceToNextLesson that passes the setCurrentLesson callback and auto-plays
  const advanceToNextLessonWrapper = useCallback(() => {
    console.log("Wrapper for advanceToNextLesson called - advancing from:", currentLesson?.title);
    
    // Get the next lesson using the callback approach to ensure it happens
    advanceToNextLesson((nextLesson) => {
      if (nextLesson) {
        console.log("Setting next lesson and auto-playing:", nextLesson.title);
        setCurrentLesson(nextLesson);
        
        // Track next lesson start in database
        if (podcast) {
          updateLessonPosition(nextLesson.id, podcast.id, 1);
        }
        
        // Auto-play the next lesson after a brief delay
        setTimeout(() => {
          setIsPlaying(true);
        }, 500);
      } else {
        console.log("No next lesson available to advance to");
        setIsPlaying(false);
      }
    });
  }, [currentLesson, advanceToNextLesson, setCurrentLesson, podcast, updateLessonPosition, setIsPlaying]);

  return {
    currentLesson,
    setCurrentLesson,
    isPlaying,
    setIsPlaying,
    initializeCurrentLesson,
    handleSelectLesson: selectLesson,
    handleTogglePlay,
    handleLessonComplete: handleLessonCompleteEnhanced,
    advanceToNextLesson: advanceToNextLessonWrapper,
    handleProgressUpdate
  };
}
