
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
    console.log(`Found next lesson: ${allAvailableLessons[currentIndex + 1].title} at index ${currentIndex + 1} of ${allAvailableLessons.length}`);
    return allAvailableLessons[currentIndex + 1];
  }
  
  console.log(`No next lesson found after index ${currentIndex} of ${allAvailableLessons.length} available lessons`);
  return null;
}
