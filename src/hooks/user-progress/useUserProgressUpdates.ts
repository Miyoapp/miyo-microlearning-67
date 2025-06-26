
import { useCallback } from 'react';
import { UserCourseProgress } from './types';

export function useUserProgressUpdates(
  userProgress: UserCourseProgress[],
  setUserProgress: React.Dispatch<React.SetStateAction<UserCourseProgress[]>>
) {
  const updateCourseProgress = useCallback(async (courseId: string, updates: Partial<UserCourseProgress>) => {
    console.log('Updating course progress:', courseId, updates);
    
    setUserProgress(prevProgress => {
      const existingIndex = prevProgress.findIndex(p => p.course_id === courseId);
      
      if (existingIndex >= 0) {
        const updatedProgress = [...prevProgress];
        updatedProgress[existingIndex] = { ...updatedProgress[existingIndex], ...updates };
        return updatedProgress;
      } else {
        const newProgress: UserCourseProgress = {
          course_id: courseId,
          progress_percentage: 0,
          is_completed: false,
          is_saved: false,
          last_listened_at: new Date().toISOString(),
          ...updates
        };
        return [...prevProgress, newProgress];
      }
    });
  }, [setUserProgress]);

  const updateLessonPosition = useCallback(async (lessonId: string, courseId: string, position: number) => {
    console.log('Mock: updating lesson position:', lessonId, courseId, position);
    // This is a mock implementation - in a real app this would update the database
  }, []);

  return {
    updateCourseProgress,
    updateLessonPosition
  };
}
