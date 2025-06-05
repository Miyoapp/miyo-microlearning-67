
import { useCallback } from 'react';
import { Podcast, Lesson } from '@/types';

/**
 * Simplified hook for local lesson progress (used as fallback when no DB)
 * Main logic is now in useConsolidatedLessons
 */
export function useLessonProgress(
  podcast: Podcast | null, 
  setPodcast: (podcast: Podcast) => void,
  currentLesson: Lesson | null
) {
  const handleLessonComplete = useCallback(() => {
    if (!podcast || !currentLesson) return;
    
    console.log(`Local fallback: Marking lesson complete: ${currentLesson.title}`);
    
    const updatedLessons = [...podcast.lessons];
    const modules = [...podcast.modules];
    
    // Find the current module and the index of the current lesson within that module
    const currentModuleIndex = modules.findIndex(module => 
      module.lessonIds.includes(currentLesson.id)
    );
    
    if (currentModuleIndex === -1) {
      console.log("No module contains this lesson. Cannot mark as complete.");
      return;
    }
    
    const currentModule = modules[currentModuleIndex];
    const currentLessonIndexInModule = currentModule.lessonIds.indexOf(currentLesson.id);
    
    // Mark the current lesson as completed
    const lessonIndex = updatedLessons.findIndex(l => l.id === currentLesson.id);
    if (lessonIndex !== -1) {
      updatedLessons[lessonIndex] = { ...updatedLessons[lessonIndex], isCompleted: true };
      console.log(`Lesson marked as completed: ${currentLesson.title}`);
    }
    
    // Determine which lesson to unlock next
    let nextLessonToUnlock: string | null = null;
    
    // If there are more lessons in the current module
    if (currentLessonIndexInModule < currentModule.lessonIds.length - 1) {
      nextLessonToUnlock = currentModule.lessonIds[currentLessonIndexInModule + 1];
      console.log(`Next lesson to unlock is in the same module: ${nextLessonToUnlock}`);
    } else {
      // If it's the last lesson of the current module and there are more modules
      if (currentModuleIndex < modules.length - 1) {
        // Check if all lessons in the current module are completed
        const allLessonsInModuleCompleted = currentModule.lessonIds.every(lessonId => {
          const lesson = updatedLessons.find(l => l.id === lessonId);
          return lesson && (lesson.id === currentLesson.id || lesson.isCompleted);
        });
        
        if (allLessonsInModuleCompleted) {
          const nextModule = modules[currentModuleIndex + 1];
          nextLessonToUnlock = nextModule.lessonIds[0];
          console.log(`Next lesson to unlock is in the next module: ${nextLessonToUnlock}`);
        }
      }
    }
    
    // Unlock the next lesson if applicable
    if (nextLessonToUnlock) {
      const nextLessonIndex = updatedLessons.findIndex(l => l.id === nextLessonToUnlock);
      if (nextLessonIndex !== -1) {
        updatedLessons[nextLessonIndex] = { ...updatedLessons[nextLessonIndex], isLocked: false };
        console.log(`Lesson unlocked: ${updatedLessons[nextLessonIndex].title}`);
      }
    }
    
    // Update the podcast with the new lessons
    setPodcast({ ...podcast, lessons: updatedLessons });
  }, [podcast, currentLesson, setPodcast]);

  return {
    handleLessonComplete
  };
}
