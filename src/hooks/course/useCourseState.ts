
import { useMemo } from 'react';
import { useUserProgress } from '@/hooks/useUserProgress';

export function useCourseState(courseId: string | undefined) {
  const { userProgress } = useUserProgress();

  const courseState = useMemo(() => {
    const courseProgress = userProgress.find(p => p.course_id === courseId);
    const isSaved = courseProgress?.is_saved || false;
    const hasStarted = (courseProgress?.progress_percentage || 0) > 0;
    const progressPercentage = courseProgress?.progress_percentage || 0;
    const isCompleted = courseProgress?.is_completed || false;
    const isReviewMode = isCompleted && progressPercentage === 100;

    return {
      courseProgress,
      isSaved,
      hasStarted,
      progressPercentage,
      isCompleted,
      isReviewMode
    };
  }, [userProgress, courseId]);

  return courseState;
}
