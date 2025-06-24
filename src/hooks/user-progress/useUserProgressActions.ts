
import { useCallback } from 'react';
import { toast } from 'sonner';
import { UserCourseProgress } from './types';

export function useUserProgressActions(
  userProgress: UserCourseProgress[],
  setUserProgress: React.Dispatch<React.SetStateAction<UserCourseProgress[]>>,
  updateCourseProgress: (courseId: string, updates: Partial<UserCourseProgress>) => Promise<void>
) {
  const toggleSaveCourse = useCallback(async (courseId: string) => {
    const currentProgress = userProgress.find(p => p.course_id === courseId);
    const newSavedState = !currentProgress?.is_saved;
    
    console.log('💾 Toggling save for course:', courseId, 'from', currentProgress?.is_saved, 'to', newSavedState);
    
    // Update local state immediately for better UX
    setUserProgress(prev => {
      const existing = prev.find(p => p.course_id === courseId);
      if (existing) {
        const updated = prev.map(p => 
          p.course_id === courseId 
            ? { ...p, is_saved: newSavedState }
            : p
        );
        console.log('💾 Updated local state for save toggle:', updated);
        return updated;
      } else {
        const newEntry = {
          course_id: courseId,
          progress_percentage: 0,
          is_completed: false,
          is_saved: newSavedState,
          last_listened_at: new Date().toISOString()
        };
        console.log('💾 Created new entry for save toggle:', newEntry);
        return [...prev, newEntry];
      }
    });
    
    await updateCourseProgress(courseId, { is_saved: newSavedState });
    toast.success(newSavedState ? 'Curso guardado' : 'Curso removido de guardados');
  }, [userProgress, setUserProgress, updateCourseProgress]);

  const startCourse = useCallback(async (courseId: string) => {
    console.log('🚀 Starting course:', courseId);
    // When a user starts a course, update their progress to show it in "Continue Learning"
    await updateCourseProgress(courseId, { 
      progress_percentage: 1, // Small progress to show it started
      last_listened_at: new Date().toISOString()
    });
  }, [updateCourseProgress]);

  return {
    toggleSaveCourse,
    startCourse
  };
}
