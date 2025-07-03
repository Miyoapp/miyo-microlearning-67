import React from 'react';
import TouchCarousel from './TouchCarousel';
import { Podcast } from '@/types';

interface CourseWithProgress {
  podcast: Podcast;
  progress: number;
  isPlaying: boolean;
  isSaved: boolean;
}

interface DashboardCourseSectionProps {
  title: string;
  courses: CourseWithProgress[];
  showProgress: boolean;
  onPlayCourse: (courseId: string) => void;
  onToggleSave: (courseId: string) => void;
  onCourseClick: (courseId: string) => void;
}

const DashboardCourseSection: React.FC<DashboardCourseSectionProps> = ({
  title,
  courses,
  showProgress,
  onPlayCourse,
  onToggleSave,
  onCourseClick,
}) => {
  if (courses.length === 0) {
    return null;
  }

  return (
    <TouchCarousel
      title={title}
      courses={courses}
      showProgress={showProgress}
      onPlayCourse={onPlayCourse}
      onToggleSave={onToggleSave}
      onCourseClick={onCourseClick}
    />
  );
};

export default DashboardCourseSection;