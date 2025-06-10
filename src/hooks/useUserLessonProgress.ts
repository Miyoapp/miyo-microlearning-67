
import { useLessonProgressData } from './lesson-progress/useLessonProgressData';
import { useLessonProgressUpdates } from './lesson-progress/useLessonProgressUpdates';
import { useLessonActions } from './lesson-progress/useLessonActions';
import { useReviewMode } from './lesson-progress/useReviewMode';

export type { UserLessonProgress } from './lesson-progress/types';

export function useUserLessonProgress() {
  const {
    lessonProgress,
    setLessonProgress,
    loading,
    refetch
  } = useLessonProgressData();

  const { updateLessonProgress } = useLessonProgressUpdates(lessonProgress, setLessonProgress);
  
  const {
    markLessonComplete,
    updateLessonPosition
  } = useLessonActions(lessonProgress, updateLessonProgress);

  const { isInReviewMode } = useReviewMode();

  return {
    lessonProgress,
    loading,
    updateLessonProgress,
    markLessonComplete,
    updateLessonPosition,
    isInReviewMode,
    refetch
  };
}
