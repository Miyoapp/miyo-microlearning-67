
import { useState, useCallback, useRef } from 'react';
import { Podcast, Lesson } from '@/types';
import { UserLessonProgress } from '@/hooks/useUserLessonProgress';
import { UserProgress } from '@/hooks/useUserProgress';
import { User } from '@supabase/supabase-js';

export function useLessonInitialization(
  podcast: Podcast | null,
  lessonProgress: UserLessonProgress[],
  userProgress: UserProgress[],
  user: User | null,
  setPodcast: (podcast: Podcast) => void
) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const initializationRef = useRef(false);

  // CRITICAL FIX: Simplified lesson state calculation
  const calculateLessonStates = useCallback((lessons: Lesson[], courseId: string) => {
    console.log('🔧 Calculating lesson states for course:', courseId);
    
    const courseProgress = userProgress.find(p => p.course_id === courseId);
    const isReviewMode = courseProgress?.is_completed && courseProgress?.progress_percentage === 100;
    
    return lessons.map((lesson, index) => {
      const progress = lessonProgress.find(p => p.lesson_id === lesson.id);
      const isCompleted = progress?.is_completed || false;
      
      // CRITICAL FIX: First lesson is ALWAYS unlocked
      const isFirstLesson = index === 0;
      
      // In review mode (100% complete), all lessons are unlocked
      if (isReviewMode) {
        return {
          ...lesson,
          isCompleted,
          isLocked: false
        };
      }
      
      // For courses in progress:
      // - First lesson: always unlocked
      // - Other lessons: unlocked if previous lesson is completed
      let isLocked = false;
      if (!isFirstLesson) {
        const previousLesson = lessons[index - 1];
        const previousProgress = lessonProgress.find(p => p.lesson_id === previousLesson.id);
        isLocked = !previousProgress?.is_completed;
      }
      
      console.log('📚 Lesson state:', {
        title: lesson.title,
        index,
        isFirstLesson,
        isCompleted,
        isLocked,
        isReviewMode
      });
      
      return {
        ...lesson,
        isCompleted,
        isLocked
      };
    });
  }, [lessonProgress, userProgress]);

  // CRITICAL FIX: Simplified podcast initialization
  const initializePodcastWithProgress = useCallback(() => {
    if (!podcast || !user) {
      console.log('❌ Cannot initialize: missing podcast or user');
      return;
    }

    console.log('🚀 INITIALIZING PODCAST WITH PROGRESS:', podcast.title);
    
    // Calculate lesson states
    const updatedLessons = calculateLessonStates(podcast.lessons, podcast.id);
    
    // Update podcast with calculated states
    const updatedPodcast = {
      ...podcast,
      lessons: updatedLessons
    };
    
    console.log('✅ Podcast updated with lesson states');
    setPodcast(updatedPodcast);
    
    initializationRef.current = true;
  }, [podcast, user, calculateLessonStates, setPodcast]);

  // CRITICAL FIX: Simplified current lesson initialization
  const initializeCurrentLesson = useCallback(() => {
    if (!podcast || !podcast.lessons || podcast.lessons.length === 0) {
      console.log('❌ Cannot initialize current lesson: no lessons available');
      setCurrentLesson(null);
      return;
    }

    console.log('🎯 INITIALIZING CURRENT LESSON...');
    
    // Find the first incomplete lesson or fall back to first lesson
    const firstIncompleteLesson = podcast.lessons.find(lesson => !lesson.isCompleted && !lesson.isLocked);
    const targetLesson = firstIncompleteLesson || podcast.lessons[0];
    
    // CRITICAL FIX: Always ensure first lesson is available
    const lessonToSet = {
      ...targetLesson,
      isLocked: targetLesson === podcast.lessons[0] ? false : targetLesson.isLocked
    };
    
    console.log('🎯 Setting current lesson:', lessonToSet.title, 'isLocked:', lessonToSet.isLocked);
    setCurrentLesson(lessonToSet);
  }, [podcast]);

  return {
    currentLesson,
    setCurrentLesson,
    initializePodcastWithProgress,
    initializeCurrentLesson
  };
}
