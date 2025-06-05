
import { useState, useCallback } from 'react';
import { Podcast, Lesson } from '@/types';
import { UserLessonProgress } from '../useUserLessonProgress';
import { UserCourseProgress } from '../useUserProgress';
import { 
  updateLessonsWithProgress, 
  unlockLessonsForCompletedCourse, 
  unlockLessonsForInProgressCourse,
  isCourseCompleted 
} from './lessonProgressUtils';

export function useLessonInitialization(
  podcast: Podcast | null,
  lessonProgress: UserLessonProgress[],
  userProgress: UserCourseProgress[],
  user: any,
  setPodcast: (podcast: Podcast) => void
) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  // Initialize podcast with correct lesson states from DB
  const initializePodcastWithProgress = useCallback(() => {
    if (!podcast || !user) return;

    console.log('Initializing podcast with progress from DB');
    
    // Update lessons with progress from database
    const updatedLessons = updateLessonsWithProgress(podcast, lessonProgress);
    const courseCompleted = isCourseCompleted(userProgress, podcast.id);

    if (courseCompleted) {
      // If course is completed, unlock ALL lessons for free replay
      console.log('Course is completed, unlocking all lessons for free replay');
      const unlockedLessons = unlockLessonsForCompletedCourse(updatedLessons);
      setPodcast({ ...podcast, lessons: unlockedLessons });
    } else {
      // For in-progress courses: unlock based on completion + ensure completed lessons are always unlocked
      console.log('Course in progress, applying unlock logic for completed and sequential lessons');
      const unlockedLessons = unlockLessonsForInProgressCourse(podcast, updatedLessons);
      
      // CRITICAL FIX: Ensure ALL completed lessons are unlocked regardless of sequence
      const finalLessons = unlockedLessons.map(lesson => ({
        ...lesson,
        isLocked: lesson.isCompleted ? false : lesson.isLocked
      }));
      
      setPodcast({ ...podcast, lessons: finalLessons });
    }
  }, [podcast, lessonProgress, userProgress, user, setPodcast]);

  // Initialize current lesson (improved logic for completed courses)
  const initializeCurrentLesson = useCallback(() => {
    if (!podcast) return;

    console.log('Initializing current lesson');
    
    const courseCompleted = isCourseCompleted(userProgress, podcast.id);

    if (courseCompleted) {
      // For completed courses, default to first lesson but don't override user selection
      if (!currentLesson) {
        const firstLesson = podcast.lessons[0];
        if (firstLesson) {
          console.log('Course completed - setting current lesson to first lesson:', firstLesson.title);
          setCurrentLesson(firstLesson);
        }
      }
    } else {
      // For in-progress courses, find first incomplete lesson that's unlocked
      const firstIncompleteLesson = podcast.lessons.find(lesson => !lesson.isCompleted && !lesson.isLocked);
      
      if (firstIncompleteLesson) {
        console.log('Setting current lesson to first incomplete:', firstIncompleteLesson.title);
        setCurrentLesson(firstIncompleteLesson);
      } else {
        // If all lessons are completed or none are unlocked, set to first lesson
        const firstLesson = podcast.lessons[0];
        if (firstLesson) {
          console.log('Setting current lesson to first lesson:', firstLesson.title);
          setCurrentLesson(firstLesson);
        }
      }
    }
  }, [podcast, userProgress, currentLesson]);

  return {
    currentLesson,
    setCurrentLesson,
    initializePodcastWithProgress,
    initializeCurrentLesson
  };
}
