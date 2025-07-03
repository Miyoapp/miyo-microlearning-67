
import React from 'react';
import CarouselContainer from './carousel/CarouselContainer';
import { Podcast } from '@/types';

interface CourseCarouselProps {
  title: string;
  courses: Array<{
    podcast: Podcast;
    progress?: number;
    isPlaying?: boolean;
    isSaved?: boolean;
  }>;
  showProgress?: boolean;
  onPlayCourse?: (courseId: string) => void;
  onToggleSave?: (courseId: string) => void;
  onCourseClick?: (courseId: string) => void;
}

const CourseCarousel: React.FC<CourseCarouselProps> = ({
  title,
  courses,
  showProgress = true,
  onPlayCourse,
  onToggleSave,
  onCourseClick
}) => {
  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-4 sm:px-0">{title}</h2>
      
      <div className="px-4 sm:px-0">
        <CarouselContainer
          courses={courses}
          showProgress={showProgress}
          onPlayCourse={onPlayCourse}
          onToggleSave={onToggleSave}
          onCourseClick={onCourseClick}
        />
      </div>
    </div>
  );
};

export default CourseCarousel;
