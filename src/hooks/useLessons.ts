
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Lesson, Podcast } from '@/types';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export function useLessons(podcast: Podcast | null) {
  const { user } = useAuth();
  const { userProgress } = useUserProgress();
  
  const [lessonsWithProgress, setLessonsWithProgress] = useState<Lesson[]>([]);
  const [lessonProgress, setLessonProgress] = useState<any[]>([]);
  
  // Fetch lesson progress from Supabase directly
  const fetchLessonProgress = useCallback(async () => {
    if (!user || !podcast) return;
    
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', podcast.id);

      if (error) {
        console.error('Error fetching lesson progress:', error);
        return;
      }
      
      setLessonProgress(data || []);
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
    }
  }, [user, podcast]);

  // Fetch lesson progress when component mounts or podcast changes
  useEffect(() => {
    fetchLessonProgress();
  }, [fetchLessonProgress]);
  
  // Stable references to prevent recalculations
  const stableProgressRef = useRef<any[]>([]);
  const stableUserProgressRef = useRef<any[]>([]);
  
  // Deep comparison for lesson progress stability
  const progressHasChanged = useMemo(() => {
    if (lessonProgress.length !== stableProgressRef.current.length) return true;
    return lessonProgress.some((item, index) => {
      const prev = stableProgressRef.current[index];
      return !prev || 
        item.lesson_id !== prev.lesson_id || 
        item.is_completed !== prev.is_completed;
    });
  }, [lessonProgress]);
  
  // Deep comparison for user progress stability
  const userProgressHasChanged = useMemo(() => {
    const relevantProgress = userProgress.find(p => p.course_id === podcast?.id);
    const prevRelevantProgress = stableUserProgressRef.current.find(p => p.course_id === podcast?.id);
    
    if (!relevantProgress && !prevRelevantProgress) return false;
    if (!relevantProgress || !prevRelevantProgress) return true;
    
    return relevantProgress.is_completed !== prevRelevantProgress.is_completed ||
           relevantProgress.progress_percentage !== prevRelevantProgress.progress_percentage;
  }, [userProgress, podcast?.id]);

  // Memoized lesson calculation to prevent unnecessary recalculations
  const calculatedLessons = useMemo(() => {
    if (!podcast || !user) return [];
    
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
  }, [podcast, lessonProgress, userProgress, user]);
  
  // Update stable references and lessons when data actually changes
  useEffect(() => {
    if (progressHasChanged) {
      stableProgressRef.current = [...lessonProgress];
    }
    if (userProgressHasChanged) {
      stableUserProgressRef.current = [...userProgress];
    }
    
    if ((progressHasChanged || userProgressHasChanged) && calculatedLessons.length > 0) {
      setLessonsWithProgress(calculatedLessons);
    }
  }, [calculatedLessons, progressHasChanged, userProgressHasChanged, lessonProgress, userProgress]);
  
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
  
  // Force refresh lessons (for realtime updates)
  const refreshLessons = useCallback(() => {
    fetchLessonProgress();
  }, [fetchLessonProgress]);
  
  return {
    lessonsWithProgress,
    getNextLessonToContinue,
    canPlayLesson,
    calculateLessonStates: refreshLessons
  };
}
