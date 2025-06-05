
import { Podcast, Lesson } from '@/types';
import { UserLessonProgress } from '../useUserLessonProgress';
import { UserCourseProgress } from '../useUserProgress';

export function updateLessonsWithProgress(
  podcast: Podcast,
  lessonProgress: UserLessonProgress[]
): Lesson[] {
  return podcast.lessons.map(lesson => {
    const progress = lessonProgress.find(p => p.lesson_id === lesson.id);
    return {
      ...lesson,
      isCompleted: progress?.is_completed || false,
      isLocked: true // Start with all locked, will be unlocked properly later
    };
  });
}

export function unlockLessonsForCompletedCourse(lessons: Lesson[]): Lesson[] {
  return lessons.map(lesson => ({ ...lesson, isLocked: false }));
}

export function unlockLessonsForInProgressCourse(
  podcast: Podcast,
  updatedLessons: Lesson[]
): Lesson[] {
  const modulesWithLessons = podcast.modules.map(module => ({
    ...module,
    lessons: module.lessonIds.map(id => updatedLessons.find(l => l.id === id)).filter(Boolean) as Lesson[]
  }));

  // Unlock first lesson of first module
  if (modulesWithLessons.length > 0 && modulesWithLessons[0].lessons.length > 0) {
    const firstLessonId = modulesWithLessons[0].lessons[0].id;
    const firstLessonIndex = updatedLessons.findIndex(l => l.id === firstLessonId);
    if (firstLessonIndex !== -1) {
      updatedLessons[firstLessonIndex] = { ...updatedLessons[firstLessonIndex], isLocked: false };
    }
  }

  // Unlock lessons following completed ones
  modulesWithLessons.forEach(module => {
    module.lessons.forEach((lesson, index) => {
      if (lesson.isCompleted && index < module.lessons.length - 1) {
        // Unlock next lesson in same module
        const nextLessonId = module.lessons[index + 1].id;
        const nextLessonIndex = updatedLessons.findIndex(l => l.id === nextLessonId);
        if (nextLessonIndex !== -1) {
          updatedLessons[nextLessonIndex] = { ...updatedLessons[nextLessonIndex], isLocked: false };
        }
      } else if (lesson.isCompleted && index === module.lessons.length - 1) {
        // If last lesson of module is completed, unlock first lesson of next module
        const currentModuleIndex = modulesWithLessons.findIndex(m => m.id === module.id);
        if (currentModuleIndex < modulesWithLessons.length - 1) {
          const nextModule = modulesWithLessons[currentModuleIndex + 1];
          if (nextModule.lessons.length > 0) {
            const nextModuleFirstLessonId = nextModule.lessons[0].id;
            const nextModuleFirstLessonIndex = updatedLessons.findIndex(l => l.id === nextModuleFirstLessonId);
            if (nextModuleFirstLessonIndex !== -1) {
              updatedLessons[nextModuleFirstLessonIndex] = { ...updatedLessons[nextModuleFirstLessonIndex], isLocked: false };
            }
          }
        }
      }
    });
  });

  return updatedLessons;
}

export function isCourseCompleted(
  userProgress: UserCourseProgress[],
  courseId: string
): boolean {
  const courseProgress = userProgress.find(p => p.course_id === courseId);
  return courseProgress?.is_completed || false;
}
