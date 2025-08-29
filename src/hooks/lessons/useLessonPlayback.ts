
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
    if (!currentLesson || !podcast || isTransitioning) {
      console.log("Cannot advance: missing lesson, podcast, or already transitioning");
      return;
    }
    
    console.log("Advancing to next lesson from", currentLesson.title);
    setIsTransitioning(true);
    
    // Get the next lesson to play
    const nextLesson = getNextLesson(podcast, currentLesson.id);
    
    if (nextLesson) {
      console.log("Next lesson found:", nextLesson.title, "- isLocked:", nextLesson.isLocked);
      
      // Important: Pause current audio first
      setIsPlaying(false);
      
      // Call the callback with the next lesson - ensure it's unlocked
      setTimeout(() => {
        console.log("Changing to next lesson:", nextLesson.title);
        callback(nextLesson);
        
        // Allow a moment for the UI to update before starting playback
        setTimeout(() => {
          console.log("Starting playback of next lesson:", nextLesson.title);
          setIsPlaying(true);
          setIsTransitioning(false);
        }, 500);
      }, 300);
    } else {
      console.log("No more lessons available");
      setIsPlaying(false);
      setIsTransitioning(false);
      
      // Optional: Show a toast when the course is complete
      toast({
        title: "Lección completada",
        description: "Has terminado todas las lecciones disponibles.",
        variant: "default"
      });
    }
  }, [currentLesson, podcast, isTransitioning, toast]);

  return {
    isPlaying,
    setIsPlaying,
    isTransitioning,
    handleTogglePlay,
    advanceToNextLesson,
    getNextLessonToPlay
  };
}
