
import { Podcast } from '@/types';

export interface NewCoursesOptions {
  daysThreshold?: number;
  fallbackDays?: number;
  maxResults?: number;
}

export const getNewCoursesCriteria = (options: NewCoursesOptions = {}) => {
  const {
    daysThreshold = 30,
    fallbackDays = 60,
    maxResults = 6
  } = options;

  const primaryDate = new Date();
  primaryDate.setDate(primaryDate.getDate() - daysThreshold);

  const fallbackDate = new Date();
  fallbackDate.setDate(fallbackDate.getDate() - fallbackDays);

  return {
    primaryDate: primaryDate.toISOString(),
    fallbackDate: fallbackDate.toISOString(),
    maxResults
  };
};

export const isNewCourse = (course: Podcast, daysThreshold: number = 30): boolean => {
  if (!course) return false;
  
  const courseDate = new Date(course.id); // Assuming course.id contains creation date info
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
  
  return courseDate >= thresholdDate;
};

export const getCoursesAge = (courses: Podcast[]): { new: Podcast[], recent: Podcast[], older: Podcast[] } => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

  return {
    new: courses.filter(course => new Date(course.id) >= thirtyDaysAgo),
    recent: courses.filter(course => {
      const courseDate = new Date(course.id);
      return courseDate >= sixtyDaysAgo && courseDate < thirtyDaysAgo;
    }),
    older: courses.filter(course => new Date(course.id) < sixtyDaysAgo)
  };
};
