
import { useState, useCallback } from 'react';
import { Podcast, Lesson } from '@/types';
import { UserLessonProgress } from '../useUserLessonProgress';
import { UserCourseProgress } from '../useUserProgress';
import { 
  updateLessonsWithProgress, 
  initializeFreshCourse,
  unlockLessonsSequentially,
  unlockAllLessonsForCompletedCourse,
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

    console.log('🎬 Initializing podcast with progress from DB');
    
    const courseCompleted = isCourseCompleted(userProgress, podcast.id);
    const hasAnyProgress = lessonProgress.length > 0;
    
    let finalLessons: Lesson[];
    
    if (courseCompleted) {
      // Course 100% completed - all lessons unlocked for review
      console.log('🏆 Course completed - enabling review mode');
      const lessonsWithProgress = updateLessonsWithProgress(podcast, lessonProgress);
      finalLessons = unlockAllLessonsForCompletedCourse(lessonsWithProgress);
    } else if (hasAnyProgress) {
      // Course in progress - apply progress and sequential unlocking
      console.log('📚 Course in progress - applying sequential unlock logic');
      const lessonsWithProgress = updateLessonsWithProgress(podcast, lessonProgress);
      finalLessons = unlockLessonsSequentially(podcast, lessonsWithProgress);
    } else {
      // Fresh course - only first lesson unlocked
      console.log('🆕 Fresh course - only first lesson unlocked');
      finalLessons = initializeFreshCourse(podcast);
    }
    
    // Debug: Log the state of the first few lessons
    console.log('🔍 First lesson states:', finalLessons.slice(0, 3).map(l => ({
      title: l.title,
      isCompleted: l.isCompleted,
      isLocked: l.isLocked
    })));
    
    setPodcast({ ...podcast, lessons: finalLessons });
  }, [podcast, lessonProgress, userProgress, user, setPodcast]);

  // Initialize current lesson with improved logic
  const initializeCurrentLesson = useCallback(() => {
    if (!podcast || !user) return;

    console.log('🎯 Initializing current lesson');
    
    const courseCompleted = isCourseCompleted(userProgress, podcast.id);

    if (courseCompleted) {
      // For completed courses, default to first lesson unless user has selected another
      if (!currentLesson) {
        const firstLesson = podcast.lessons[0];
        if (firstLesson) {
          console.log('🏆 Course completed - setting to first lesson for review:', firstLesson.title);
          setCurrentLesson(firstLesson);
        }
      }
    } else {
      // For in-progress courses, find the appropriate lesson to start with
      const firstUnlockedLesson = podcast.lessons.find(lesson => !lesson.isLocked);
      
      if (firstUnlockedLesson && !currentLesson) {
        console.log('📚 Setting current lesson to first unlocked:', firstUnlockedLesson.title);
        setCurrentLesson(firstUnlockedLesson);
      } else if (!firstUnlockedLesson) {
        // Fallback to first lesson if no unlocked lessons found
        const firstLesson = podcast.lessons[0];
        if (firstLesson) {
          console.log('🔄 Fallback to first lesson:', firstLesson.title);
          setCurrentLesson(firstLesson);
        }
      }
    }
  }, [podcast, userProgress, currentLesson, user]);

  return {
    currentLesson,
    setCurrentLesson,
    initializePodcastWithProgress,
    initializeCurrentLesson
  };
}
