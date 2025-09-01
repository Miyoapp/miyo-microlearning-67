
import { useState, useCallback, useEffect } from 'react';
import { Lesson, Podcast } from '@/types';
import { useUserLessonProgress } from '@/hooks/useUserLessonProgress';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';

export function useLessons(podcast: Podcast | null) {
  const { user } = useAuth();
  const { lessonProgress } = useUserLessonProgress();
  const { userProgress } = useUserProgress();
  
  const [lessonsWithProgress, setLessonsWithProgress] = useState<Lesson[]>([]);
  
  // Calculate lesson states with progress
  const calculateLessonStates = useCallback(() => {
    if (!podcast) return [];
    
    console.log('📚 useLessons: Calculating lesson states for:', podcast.title);
    
    const courseProgress = userProgress.find(p => p.course_id === podcast.id);
    const isReviewMode = courseProgress?.is_completed && courseProgress?.progress_percentage === 100;
    
    // Get first lesson ID for unlocking
    const firstModule = podcast.modules[0];
    const firstLessonId = firstModule?.lessonIds?.[0];
    
    const updatedLessons = podcast.lessons.map((lesson, index) => {
      const progress = lessonProgress.find(p => p.lesson_id === lesson.id);
      const isCompleted = progress?.is_completed || false;
      
      let isLocked = false;
      
      if (isReviewMode) {
        // Review mode: all lessons unlocked
        isLocked = false;
      } else if (lesson.id === firstLessonId) {
        // First lesson always unlocked
        isLocked = false;
      } else if (isCompleted) {
        // Completed lessons always unlocked
        isLocked = false;
      } else {
        // Check if previous lesson is completed
        const previousLesson = podcast.lessons[index - 1];
        if (previousLesson) {
          const previousProgress = lessonProgress.find(p => p.lesson_id === previousLesson.id);
          isLocked = !previousProgress?.is_completed;
        }
      }
      
      return {
        ...lesson,
        isCompleted,
        isLocked
      };
    });
    
    console.log('✅ useLessons: Lesson states calculated');
    return updatedLessons;
  }, [podcast, lessonProgress, userProgress]);
  
  // Update lessons when data changes
  useEffect(() => {
    if (podcast && user) {
      const updated = calculateLessonStates();
      setLessonsWithProgress(updated);
    }
  }, [podcast, user, lessonProgress, userProgress, calculateLessonStates]);
  
  // Find next lesson to continue (for auto-positioning)
  const getNextLessonToContinue = useCallback(() => {
    if (!podcast) return null;
    
    const courseProgress = userProgress.find(p => p.course_id === podcast.id);
    const isReviewMode = courseProgress?.is_completed && courseProgress?.progress_percentage === 100;
    const hasStarted = (courseProgress?.progress_percentage || 0) > 0;
    
    // No auto-positioning in review mode or if course hasn't started
    if (isReviewMode || !hasStarted) return null;
    
    // Find first incomplete and unlocked lesson
    return lessonsWithProgress.find(lesson => !lesson.isCompleted && !lesson.isLocked) || null;
  }, [podcast, userProgress, lessonsWithProgress]);
  
  // Check if lesson can be played
  const canPlayLesson = useCallback((lesson: Lesson) => {
    const lessonWithProgress = lessonsWithProgress.find(l => l.id === lesson.id);
    return lessonWithProgress ? !lessonWithProgress.isLocked : false;
  }, [lessonsWithProgress]);
  
  return {
    lessonsWithProgress,
    getNextLessonToContinue,
    canPlayLesson,
    calculateLessonStates
  };
}
