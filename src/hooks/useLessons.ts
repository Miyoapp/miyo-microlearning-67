
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
  const [forceUpdateFlag, setForceUpdateFlag] = useState(0);
  
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
  
  // Force immediate updates - no complex memoization blocking
  const lastUpdateRef = useRef<number>(0);

  // Calculate lessons immediately - SYNCHRONOUS updates only
  const calculateLessonsStates = useCallback(() => {
    if (!podcast || !user) return [];
    
    console.log('📚 useLessons: IMMEDIATE calculation for:', podcast.title);
    
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
        isLocked = false;
      } else if (lesson.id === firstLessonId) {
        isLocked = false;
      } else if (isCompleted) {
        isLocked = false;
      } else {
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
    
    // IMMEDIATE update - no delays
    console.log('✅ useLessons: IMMEDIATE state update');
    setLessonsWithProgress(updatedLessons);
    setForceUpdateFlag(prev => prev + 1);
    return updatedLessons;
  }, [podcast, lessonProgress, userProgress, user, forceUpdateFlag]);
  
  // Update lessons immediately when data changes
  useEffect(() => {
    calculateLessonsStates();
  }, [calculateLessonsStates]);
  
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
  
  // Force refresh lessons (for realtime updates) - SYNCHRONOUS
  const refreshLessons = useCallback(async () => {
    console.log('🔄 useLessons: IMMEDIATE refresh starting');
    await fetchLessonProgress();
    
    // IMMEDIATE recalculation - no setTimeout delays
    console.log('🔄 useLessons: Forcing immediate recalculation');
    const freshLessons = calculateLessonsStates();
    
    console.log('✅ useLessons: IMMEDIATE refresh complete');
    return freshLessons;
  }, [fetchLessonProgress, calculateLessonsStates]);
  
  return {
    lessonsWithProgress,
    getNextLessonToContinue,
    canPlayLesson,
    calculateLessonStates: refreshLessons,
    lessonProgress // Export for DashboardCourse
  };
}
