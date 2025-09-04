
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

  // Helper function to get ordered lessons based on modules
  const getOrderedLessons = useCallback(() => {
    if (!podcast?.modules) return podcast?.lessons || [];
    
    const orderedLessons: Lesson[] = [];
    podcast.modules.forEach(module => {
      module.lessonIds.forEach(lessonId => {
        const lesson = podcast.lessons.find(l => l.id === lessonId);
        if (lesson) {
          orderedLessons.push(lesson);
        }
      });
    });
    return orderedLessons;
  }, [podcast]);

  // Calculate lessons immediately - SYNCHRONOUS updates only
  const calculateLessonsStates = useCallback(() => {
    if (!podcast || !user) return [];
    
    console.log('📚 useLessons: IMMEDIATE calculation for:', podcast.title);
    
    const courseProgress = userProgress.find(p => p.course_id === podcast.id);
    const isReviewMode = courseProgress?.is_completed && courseProgress?.progress_percentage === 100;
    
    // Get ordered lessons based on module structure
    const orderedLessons = getOrderedLessons();
    const firstLessonId = orderedLessons[0]?.id;
    
    const updatedLessons = podcast.lessons.map((lesson) => {
      const progress = lessonProgress.find(p => p.lesson_id === lesson.id);
      const isCompleted = progress?.is_completed || false;
      
      let isLocked = false;
      
      // CRITICAL: Completed lessons are NEVER locked
      if (isCompleted) {
        isLocked = false;
      } else if (isReviewMode) {
        isLocked = false;
      } else if (lesson.id === firstLessonId) {
        isLocked = false;
      } else {
        // Find this lesson's position in the ordered sequence
        const currentIndex = orderedLessons.findIndex(l => l.id === lesson.id);
        if (currentIndex > 0) {
          const previousLesson = orderedLessons[currentIndex - 1];
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
