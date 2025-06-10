
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

  // FIXED: Initialize current lesson more reliably
  const initializeCurrentLesson = useCallback(() => {
    if (!podcast || !user || !podcast.lessons || podcast.lessons.length === 0) {
      console.log('⚠️ Cannot initialize lesson - missing data');
      return;
    }

    console.log('🎯 Initializing current lesson');
    
    const courseCompleted = isCourseCompleted(userProgress, podcast.id);

    // FIXED: Always find and set the first available lesson
    let lessonToSelect: Lesson | null = null;

    if (courseCompleted) {
      // For completed courses, default to first lesson for review
      lessonToSelect = podcast.lessons[0] || null;
      console.log('🏆 Course completed - selecting first lesson for review:', lessonToSelect?.title);
    } else {
      // For in-progress or new courses, find first unlocked lesson
      lessonToSelect = podcast.lessons.find(lesson => !lesson.isLocked) || podcast.lessons[0] || null;
      console.log('📚 Course in progress - selecting first unlocked lesson:', lessonToSelect?.title);
    }

    if (lessonToSelect && !currentLesson) {
      console.log('✅ Setting current lesson to:', lessonToSelect.title);
      setCurrentLesson(lessonToSelect);
    } else if (!lessonToSelect) {
      console.log('❌ No lesson available to select');
    } else {
      console.log('⏭️ Current lesson already set:', currentLesson?.title);
    }
  }, [podcast, userProgress, currentLesson, user]);

  return {
    currentLesson,
    setCurrentLesson,
    initializePodcastWithProgress,
    initializeCurrentLesson
  };
}
