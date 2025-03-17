import { useState, useCallback } from 'react';
import { Lesson } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { getNextLesson } from './lessonUtils';

interface UseLessonPlaybackProps {
  currentLesson: Lesson | null;
  podcast: any;
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

  // Advance to the next lesson and keep playing
  const advanceToNextLesson = useCallback((setCurrentLesson: (lesson: Lesson) => void) => {
    if (!currentLesson || isTransitioning) return;
    
    console.log("Advancing to next lesson from", currentLesson.id);
    setIsTransitioning(true);
    
    const nextLesson = getNextLesson(podcast, currentLesson.id);
    if (nextLesson) {
      console.log("Next lesson found:", nextLesson.id, nextLesson.title);
      
      // First pause current audio to avoid conflicts
      setIsPlaying(false);
      
      // Short delay before switching to next lesson and starting playback
      setTimeout(() => {
        setCurrentLesson(nextLesson);
        
        // Wait for lesson to be set before playing
        setTimeout(() => {
          // Start playing the next lesson
          setIsPlaying(true);
          setIsTransitioning(false);
          
          toast({
            title: "Reproduciendo siguiente lección",
            description: nextLesson.title,
            variant: "default"
          });
        }, 200);
      }, 500);
    } else {
      // No more lessons available
      setIsPlaying(false);
      setIsTransitioning(false);
      toast({
        title: "Fin de las lecciones disponibles",
        description: "Has completado todas las lecciones disponibles.",
        variant: "default"
      });
    }
  }, [currentLesson, podcast, isTransitioning, toast]);

  return {
    isPlaying,
    setIsPlaying,
    isTransitioning,
    handleTogglePlay,
    advanceToNextLesson
  };
}
