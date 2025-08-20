
import { useUserProgressData } from './user-progress/useUserProgressData';
import { useUserProgressUpdates } from './user-progress/useUserProgressUpdates';
import { useUserProgressActions } from './user-progress/useUserProgressActions';

export type { UserCourseProgress } from './user-progress/types';

export function useUserProgress() {
  const { userProgress, setUserProgress, loading, refetch } = useUserProgressData();
  const { updateCourseProgress, markCompletionModalShown } = useUserProgressUpdates(userProgress, setUserProgress);
  const { toggleSaveCourse, startCourse } = useUserProgressActions(userProgress, setUserProgress, updateCourseProgress);

  return {
    userProgress,
    loading,
    updateCourseProgress,
    markCompletionModalShown,
    toggleSaveCourse,
    startCourse,
    refetch
  };
}
