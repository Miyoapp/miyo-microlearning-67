
import { Podcast, Lesson } from '@/types';

/**
 * Gets the first available (unlocked) lesson from a podcast
 */
export function getFirstAvailableLesson(podcast: Podcast | null): Lesson | null {
  if (!podcast) return null;
  return podcast.lessons.find(lesson => !lesson.isLocked) || null;
}

/**
 * Gets the next lesson in sequence based on the current lesson ID
 */
export function getNextLesson(podcast: Podcast | null, currentLessonId: string): Lesson | null {
  if (!podcast) return null;
  
  // Find all modules and their lessons in order
  const orderedLessonIds: string[] = [];
  podcast.modules.forEach(module => {
    module.lessonIds.forEach(lessonId => {
      orderedLessonIds.push(lessonId);
    });
  });
  
  // Find current lesson index in the ordered list
  const currentIndex = orderedLessonIds.indexOf(currentLessonId);
  
  // If we found the current lesson and there's a next one
  if (currentIndex !== -1 && currentIndex < orderedLessonIds.length - 1) {
    const nextLessonId = orderedLessonIds[currentIndex + 1];
    const nextLesson = podcast.lessons.find(l => l.id === nextLessonId);
    
    // Important: Mark the next lesson as unlocked to ensure it can be played
    if (nextLesson) {
      console.log(`Found next lesson: ${nextLesson.title}`);
      
      // Return a copy of the lesson with isLocked set to false
      // This ensures the player can access it
      return { ...nextLesson, isLocked: false };
    }
  }
  
  console.log(`No next lesson found after index ${currentIndex}`);
  return null;
}
