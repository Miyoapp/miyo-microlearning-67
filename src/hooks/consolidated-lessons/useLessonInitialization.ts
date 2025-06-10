
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
    if (!podcast || !user) {
      console.log('🚫 Cannot initialize podcast - missing data:', { podcast: !!podcast, user: !!user });
      return;
    }

    console.log('🎬 Initializing podcast with progress from DB');
    console.log('📊 Lesson progress count:', lessonProgress.length);
    console.log('📊 User progress count:', userProgress.length);
    
    const courseCompleted = isCourseCompleted(userProgress, podcast.id);
    const hasAnyProgress = lessonProgress.length > 0;
    
    console.log('📋 Course status:', { courseCompleted, hasAnyProgress });
    
    let finalLessons: Lesson[];
    
    if (courseCompleted) {
      console.log('🏆 Course completed - enabling review mode');
      const lessonsWithProgress = updateLessonsWithProgress(podcast, lessonProgress);
      finalLessons = unlockAllLessonsForCompletedCourse(lessonsWithProgress);
    } else if (hasAnyProgress) {
      console.log('📚 Course in progress - applying sequential unlock logic');
      const lessonsWithProgress = updateLessonsWithProgress(podcast, lessonProgress);
      finalLessons = unlockLessonsSequentially(podcast, lessonsWithProgress);
    } else {
      console.log('🆕 Fresh course - only first lesson unlocked');
      finalLessons = initializeFreshCourse(podcast);
    }
    
    console.log('🔍 Final lesson states:', finalLessons.slice(0, 3).map(l => ({
      title: l.title,
      isCompleted: l.isCompleted,
      isLocked: l.isLocked
    })));
    
    setPodcast({ ...podcast, lessons: finalLessons });
  }, [podcast, lessonProgress, userProgress, user, setPodcast]);

  // CRITICAL FIX: Auto-initialize current lesson more reliably
  const initializeCurrentLesson = useCallback(() => {
    console.log('🎯 INITIALIZING CURRENT LESSON - START');
    console.log('🔍 Current state check:', {
      hasPodcast: !!podcast,
      hasUser: !!user,
      lessonsCount: podcast?.lessons?.length || 0,
      currentLessonExists: !!currentLesson,
      currentLessonTitle: currentLesson?.title
    });

    if (!podcast || !user) {
      console.log('⚠️ Cannot initialize lesson - missing basic data');
      return;
    }

    if (!podcast.lessons || podcast.lessons.length === 0) {
      console.log('⚠️ Cannot initialize lesson - no lessons available');
      return;
    }

    // If current lesson is already set, don't override it
    if (currentLesson) {
      console.log('✅ Current lesson already set:', currentLesson.title);
      return;
    }

    console.log('🎯 Finding lesson to select...');
    
    const courseCompleted = isCourseCompleted(userProgress, podcast.id);
    let lessonToSelect: Lesson | null = null;

    if (courseCompleted) {
      // For completed courses, default to first lesson for review
      lessonToSelect = podcast.lessons[0] || null;
      console.log('🏆 Course completed - selecting first lesson for review:', lessonToSelect?.title);
    } else {
      // For in-progress or new courses, find first unlocked lesson
      lessonToSelect = podcast.lessons.find(lesson => !lesson.isLocked) || podcast.lessons[0] || null;
      console.log('📚 Course in progress - finding first unlocked lesson');
      console.log('🔍 Available lessons:', podcast.lessons.map(l => ({ title: l.title, isLocked: l.isLocked })));
      console.log('🎯 Selected lesson:', lessonToSelect?.title);
    }

    if (lessonToSelect) {
      console.log('✅ SETTING CURRENT LESSON TO:', lessonToSelect.title);
      setCurrentLesson(lessonToSelect);
    } else {
      console.log('❌ No lesson available to select');
    }
  }, [podcast, userProgress, currentLesson, user]);

  return {
    currentLesson,
    setCurrentLesson,
    initializePodcastWithProgress,
    initializeCurrentLesson
  };
}
