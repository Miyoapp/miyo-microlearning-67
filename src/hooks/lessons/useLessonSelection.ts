
import { useState, useCallback } from 'react';
import { Podcast, Lesson } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { getFirstAvailableLesson } from './lessonUtils';

/**
 * Hook to handle lesson selection
 */
export function useLessonSelection(podcast: Podcast | null) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const { toast } = useToast();

  // Initialize with first available lesson
  const initializeCurrentLesson = useCallback(() => {
    if (!podcast) return;
    const firstLesson = getFirstAvailableLesson(podcast);
    if (firstLesson) {
      setCurrentLesson(firstLesson);
    }
  }, [podcast]);

  // Handle selecting a lesson
  const handleSelectLesson = (lesson: Lesson, setIsPlaying: (isPlaying: boolean) => void) => {
    if (lesson.isLocked) {
      toast({
        title: "Lección bloqueada",
        description: "Completa las lecciones anteriores para desbloquear esta.",
        variant: "default"
      });
      return;
    }
    
    // If selecting the same lesson that's already playing, just toggle play/pause
    if (currentLesson && lesson.id === currentLesson.id) {
      // This will be handled outside by passing the toggle function to avoid circular dependencies
      return;
    }
    
    setCurrentLesson(lesson);
    // Start playback automatically when selecting from learning path
    setIsPlaying(true);
  };

  return {
    currentLesson,
    setCurrentLesson,
    initializeCurrentLesson,
    handleSelectLesson
  };
}
