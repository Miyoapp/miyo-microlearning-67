
import { useCallback } from 'react';
import { Podcast, Lesson } from '@/types';
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook to handle lesson completion and progression
 */
export function useLessonProgress(
  podcast: Podcast | null, 
  setPodcast: (podcast: Podcast) => void,
  currentLesson: Lesson | null
) {
  const { toast } = useToast();

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
    
    // Mostrar el mensaje de lección completada
    toast({
      title: "¡Lección completada!",
      description: unlockDescription,
      variant: "default"
    });
  }, [podcast, currentLesson, setPodcast, toast]);

  return {
    handleLessonComplete
  };
}
