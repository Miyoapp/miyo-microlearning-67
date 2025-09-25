
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
  subtitle?: string;
  courses: CourseWithProgress[];
  showProgress: boolean;
  onPlayCourse: (courseId: string) => void;
  onToggleSave: (courseId: string) => void;
  onCourseClick: (courseId: string) => void;
  onCourseHover?: (courseId: string) => void;
}

const DashboardCourseSection: React.FC<DashboardCourseSectionProps> = ({
  title,
  subtitle,
  courses,
  showProgress,
  onPlayCourse,
  onToggleSave,
  onCourseClick,
  onCourseHover,
}) => {
  // Debug logging to understand why "Continúa escuchando" might not show
  console.log('📚 DashboardCourseSection render:', {
    title,
    coursesCount: courses.length,
    showProgress,
    timestamp: new Date().toLocaleTimeString()
  });

  if (courses.length === 0) {
    // Show a placeholder for "Continúa escuchando" when empty to help with debugging
    if (title.includes('Continúa escuchando')) {
      console.log('🔍 "Continúa escuchando" section has no courses - this might be the issue');
    }
    return null;
  }

  return (
    <div className="mb-8 sm:mb-12">
      <div className="mb-6 px-4 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{title}</h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-gray-600">{subtitle}</p>
        )}
      </div>
      
      <TouchCarousel
        title=""
        courses={courses}
        showProgress={showProgress}
        onPlayCourse={onPlayCourse}
        onToggleSave={onToggleSave}
        onCourseClick={onCourseClick}
        onCourseHover={onCourseHover}
      />
    </div>
  );
};

export default DashboardCourseSection;
