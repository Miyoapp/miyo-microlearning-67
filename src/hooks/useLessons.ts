
import { useState, useCallback } from 'react';
import { Podcast, Lesson } from '@/types';
import { useToast } from "@/components/ui/use-toast";

export function useLessons(podcast: Podcast | null, setPodcast: (podcast: Podcast) => void) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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
  const handleSelectLesson = (lesson: Lesson) => {
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
      handleTogglePlay();
      return;
    }
    
    setCurrentLesson(lesson);
    // Start playback automatically when selecting from learning path
    setIsPlaying(true);
  };

  // Get the next lesson in sequence (used for autoplay and navigation)
  const getNextLesson = useCallback((currentLessonId: string): Lesson | null => {
    if (!podcast) return null;
    
    // Find all unlocked lesson IDs in the correct order from modules
    const allAvailableLessons: Lesson[] = [];
    podcast.modules.forEach(module => {
      module.lessonIds.forEach(lessonId => {
        const lesson = podcast.lessons.find(l => l.id === lessonId);
        if (lesson && !lesson.isLocked) {
          allAvailableLessons.push(lesson);
        }
      });
    });

    // Find the index of the current lesson
    const currentIndex = allAvailableLessons.findIndex(lesson => lesson.id === currentLessonId);
    
    // If we found the current lesson and there's a next one available
    if (currentIndex !== -1 && currentIndex < allAvailableLessons.length - 1) {
      return allAvailableLessons[currentIndex + 1];
    }
    
    return null;
  }, [podcast]);

  // Advance to the next lesson and keep playing
  const advanceToNextLesson = useCallback(() => {
    if (!currentLesson) return;
    
    console.log("Advancing to next lesson from", currentLesson.id);
    
    const nextLesson = getNextLesson(currentLesson.id);
    if (nextLesson) {
      console.log("Next lesson found:", nextLesson.id, nextLesson.title);
      
      // First pause current audio to avoid conflicts
      setIsPlaying(false);
      
      // Short delay before switching to next lesson and starting playback
      setTimeout(() => {
        setCurrentLesson(nextLesson);
        // Start playing the next lesson
        setIsPlaying(true);
        
        toast({
          title: "Reproduciendo siguiente lección",
          description: nextLesson.title,
          variant: "default"
        });
      }, 500); // Increased delay for better stability
    } else {
      // No more lessons available
      setIsPlaying(false);
      toast({
        title: "Fin de las lecciones disponibles",
        description: "Has completado todas las lecciones disponibles.",
        variant: "default"
      });
    }
  }, [currentLesson, getNextLesson, toast]);

  // Handle toggling play state
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle lesson completion
  const handleLessonComplete = useCallback(() => {
    if (!podcast || !currentLesson) return;
    
    // Create a copy of the lessons to modify
    const updatedLessons = [...podcast.lessons];
    const modules = [...podcast.modules];
    
    // Find the current module and the index of the current lesson within that module
    const currentModuleIndex = modules.findIndex(module => 
      module.lessonIds.includes(currentLesson.id)
    );
    
    if (currentModuleIndex === -1) return;
    
    const currentModule = modules[currentModuleIndex];
    const currentLessonIndexInModule = currentModule.lessonIds.indexOf(currentLesson.id);
    
    // Mark the current lesson as completed
    const lessonIndex = updatedLessons.findIndex(l => l.id === currentLesson.id);
    if (lessonIndex !== -1) {
      updatedLessons[lessonIndex] = { ...updatedLessons[lessonIndex], isCompleted: true };
    }
    
    // Determine which lesson to unlock next
    let nextLessonToUnlock: string | null = null;
    let unlockDescription = "";
    
    // If there are more lessons in the current module
    if (currentLessonIndexInModule < currentModule.lessonIds.length - 1) {
      // Unlock the next lesson in the same module
      nextLessonToUnlock = currentModule.lessonIds[currentLessonIndexInModule + 1];
      unlockDescription = "La siguiente lección ha sido desbloqueada.";
    } else {
      // If it's the last lesson of the current module and there are more modules
      if (currentModuleIndex < modules.length - 1) {
        // Check if all lessons in the current module are completed
        const allLessonsInModuleCompleted = currentModule.lessonIds.every(lessonId => {
          const lesson = updatedLessons.find(l => l.id === lessonId);
          return lesson && (lesson.id === currentLesson.id || lesson.isCompleted);
        });
        
        if (allLessonsInModuleCompleted) {
          // Unlock the first lesson of the next module
          const nextModule = modules[currentModuleIndex + 1];
          nextLessonToUnlock = nextModule.lessonIds[0];
          unlockDescription = "¡Módulo completado! La primera lección del siguiente módulo ha sido desbloqueada.";
        }
      } else {
        // It was the last lesson of the last module
        unlockDescription = "¡Has completado todas las lecciones del curso!";
      }
    }
    
    // Unlock the next lesson if applicable
    if (nextLessonToUnlock) {
      const nextLessonIndex = updatedLessons.findIndex(l => l.id === nextLessonToUnlock);
      if (nextLessonIndex !== -1) {
        updatedLessons[nextLessonIndex] = { ...updatedLessons[nextLessonIndex], isLocked: false };
      }
    }
    
    // Update the podcast with the new lessons
    setPodcast({ ...podcast, lessons: updatedLessons });
    
    // Notify the user
    toast({
      title: "¡Lección completada!",
      description: unlockDescription,
      variant: "default"
    });
  }, [podcast, currentLesson, setPodcast, toast]);

  return {
    currentLesson,
    setCurrentLesson,
    isPlaying,
    setIsPlaying,
    initializeCurrentLesson,
    handleSelectLesson,
    handleTogglePlay,
    handleLessonComplete,
    getNextLesson,
    advanceToNextLesson
  };
}

// Helper function to get first available lesson
function getFirstAvailableLesson(podcast: Podcast): Lesson | null {
  return podcast.lessons.find(lesson => !lesson.isLocked) || null;
}
