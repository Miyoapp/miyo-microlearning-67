
import { useState, useCallback } from 'react';
import { Lesson, Podcast } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { getNextLesson } from './lessonUtils';

interface UseLessonPlaybackProps {
  currentLesson: Lesson | null;
  podcast: Podcast | null;
}

/**
 * Hook to handle lesson playback controls
 */
export function useLessonPlayback({ currentLesson, podcast }: UseLessonPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();

  // Handle toggling play state
  const handleTogglePlay = () => {
    if (isTransitioning) return;
    setIsPlaying(!isPlaying);
  };

  // Get the next lesson without immediately advancing to it
  const getNextLessonToPlay = useCallback(() => {
    if (!currentLesson || !podcast) return null;
    return getNextLesson(podcast, currentLesson.id);
  }, [currentLesson, podcast]);

  // Advance to the next lesson
  const advanceToNextLesson = useCallback((callback: (nextLesson: Lesson) => void) => {
    if (!currentLesson || !podcast || isTransitioning) return;
    
    console.log("Advancing to next lesson from", currentLesson.id);
    setIsTransitioning(true);
    
    const nextLesson = getNextLesson(podcast, currentLesson.id);
    if (nextLesson) {
      console.log("Next lesson found:", nextLesson.id, nextLesson.title);
      
      // First pause current audio to avoid conflicts
      setIsPlaying(false);
      
      // Short delay before switching to next lesson and starting playback
      setTimeout(() => {
        console.log("Invoking callback with next lesson");
        // Invoke callback with the next lesson
        callback(nextLesson);
        
        // Wait for lesson to be set before playing
        setTimeout(() => {
          console.log("Starting playback of next lesson");
          // Start playing the next lesson
          setIsPlaying(true);
          setIsTransitioning(false);
        }, 800);
      }, 1000);
    } else {
      console.log("No more lessons available");
      // No more lessons available - don't show any message
      setIsPlaying(false);
      setIsTransitioning(false);
    }
  }, [currentLesson, podcast, isTransitioning]);

  return {
    isPlaying,
    setIsPlaying,
    isTransitioning,
    handleTogglePlay,
    advanceToNextLesson,
    getNextLessonToPlay
  };
}
