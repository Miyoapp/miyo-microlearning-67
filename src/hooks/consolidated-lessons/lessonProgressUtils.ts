
import { Podcast, Lesson } from '@/types';
import { UserLessonProgress } from '../useUserLessonProgress';
import { UserCourseProgress } from '../useUserProgress';

export function updateLessonsWithProgress(
  podcast: Podcast,
  lessonProgress: UserLessonProgress[]
): Lesson[] {
  return podcast.lessons.map(lesson => {
    const progress = lessonProgress.find(p => p.lesson_id === lesson.id);
    const isCompleted = progress?.is_completed || false;
    
    return {
      ...lesson,
      isCompleted,
      // CRITICAL FIX: Completed lessons are NEVER locked
      isLocked: !isCompleted
    };
  });
}

export function initializeFreshCourse(podcast: Podcast): Lesson[] {
  console.log('🆕 Initializing fresh course - only first lesson unlocked');
  
  // Get the first module and its first lesson
  const firstModule = podcast.modules[0];
  const firstLessonId = firstModule?.lessonIds?.[0];
  
  return podcast.lessons.map(lesson => ({
    ...lesson,
    isCompleted: false,
    // Only the very first lesson is unlocked initially
    isLocked: lesson.id !== firstLessonId
  }));
}

export function unlockLessonsSequentially(
  podcast: Podcast,
  updatedLessons: Lesson[]
): Lesson[] {
  console.log('🔓 Applying sequential unlock logic...');
  
  const modulesWithLessons = podcast.modules.map(module => ({
    ...module,
    lessons: module.lessonIds.map(id => updatedLessons.find(l => l.id === id)).filter(Boolean) as Lesson[]
  }));

  // Process each module sequentially
  modulesWithLessons.forEach((module, moduleIndex) => {
    module.lessons.forEach((lesson, lessonIndex) => {
      const globalLessonIndex = updatedLessons.findIndex(l => l.id === lesson.id);
      
      if (lesson.isCompleted) {
        // PROTECTION: Completed lessons are always unlocked
        console.log('✅ Keeping completed lesson unlocked:', lesson.title);
        updatedLessons[globalLessonIndex] = { ...updatedLessons[globalLessonIndex], isLocked: false };
        
        // Unlock next lesson in sequence
        if (lessonIndex < module.lessons.length - 1) {
          // Next lesson in same module
          const nextLessonId = module.lessons[lessonIndex + 1].id;
          const nextLessonIndex = updatedLessons.findIndex(l => l.id === nextLessonId);
          if (nextLessonIndex !== -1) {
            console.log('🔓 Unlocking next lesson in module:', updatedLessons[nextLessonIndex].title);
            updatedLessons[nextLessonIndex] = { ...updatedLessons[nextLessonIndex], isLocked: false };
          }
        } else if (moduleIndex < modulesWithLessons.length - 1) {
          // First lesson of next module
          const nextModule = modulesWithLessons[moduleIndex + 1];
          if (nextModule.lessons.length > 0) {
            const nextModuleFirstLessonId = nextModule.lessons[0].id;
            const nextModuleFirstLessonIndex = updatedLessons.findIndex(l => l.id === nextModuleFirstLessonId);
            if (nextModuleFirstLessonIndex !== -1) {
              console.log('🔓 Unlocking first lesson of next module:', updatedLessons[nextModuleFirstLessonIndex].title);
              updatedLessons[nextModuleFirstLessonIndex] = { ...updatedLessons[nextModuleFirstLessonIndex], isLocked: false };
            }
          }
        }
      }
    });
  });

  return updatedLessons;
}

export function unlockAllLessonsForCompletedCourse(lessons: Lesson[]): Lesson[] {
  console.log('🏆 Course 100% completed - unlocking all lessons for review');
  return lessons.map(lesson => ({ 
    ...lesson, 
    isLocked: false // All lessons available for review
  }));
}

export function isCourseCompleted(
  userProgress: UserCourseProgress[],
  courseId: string
): boolean {
  const courseProgress = userProgress.find(p => p.course_id === courseId);
  return courseProgress?.is_completed && courseProgress?.progress_percentage === 100;
}
