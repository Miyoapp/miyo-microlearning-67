
import React from 'react';
import CarouselContainer from './carousel/CarouselContainer';
import { Podcast } from '@/types';

interface TouchCarouselProps {
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
  onCourseHover?: (courseId: string) => void;
}

const TouchCarousel: React.FC<TouchCarouselProps> = ({
  title,
  courses,
  showProgress = true,
  onPlayCourse,
  onToggleSave,
  onCourseClick,
  onCourseHover
}) => {
  return (
    <div className="mb-8 sm:mb-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 px-4 sm:px-0">{title}</h2>
      
      <CarouselContainer
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

export default TouchCarousel;
