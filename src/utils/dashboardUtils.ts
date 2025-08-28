
import { Podcast } from '@/types';

interface UserProgress {
  course_id: string;
  progress_percentage?: number;
  is_saved?: boolean;
}

interface CourseWithProgress {
  podcast: Podcast;
  progress: number;
  isPlaying: boolean;
  isSaved: boolean;
}

export const getContinueLearningCourses = (
  allCourses: Podcast[],
  userProgress: UserProgress[]
): CourseWithProgress[] => {
  return allCourses
    .map(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      const progressPercentage = progress?.progress_percentage || 0;
      return {
        podcast: course,
        progress: progressPercentage,
        isPlaying: false,
        isSaved: progress?.is_saved || false
      };
    })
    .filter(course => course.progress > 0 && course.progress < 100);
};

export const getFreeCourses = (
  allCourses: Podcast[],
  userProgress: UserProgress[]
): CourseWithProgress[] => {
  return allCourses
    .filter(course => course.tipo_curso === 'libre')
    .slice(0, 4)
    .map(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return {
        podcast: course,
        progress: progress?.progress_percentage || 0,
        isPlaying: false,
        isSaved: progress?.is_saved || false
      };
    });
};

export const getPremiumCourses = (
  allCourses: Podcast[],
  userProgress: UserProgress[]
): CourseWithProgress[] => {
  return allCourses
    .filter(course => course.tipo_curso === 'pago')
    .slice(0, 6)
    .map(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return {
        podcast: course,
        progress: progress?.progress_percentage || 0,
        isPlaying: false,
        isSaved: progress?.is_saved || false
      };
    });
};
