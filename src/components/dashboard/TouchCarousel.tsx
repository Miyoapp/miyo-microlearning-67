
import React, { useCallback, useEffect, useState } from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import CourseCardWithProgress from './CourseCardWithProgress';
import { Podcast } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

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
}

const TouchCarousel: React.FC<TouchCarouselProps> = ({
  title,
  courses,
  showProgress = true,
  onPlayCourse,
  onToggleSave,
  onCourseClick
}) => {
  const isMobile = useIsMobile();

  const options: EmblaOptionsType = {
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: true,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  if (courses.length === 0) {
    return (
      <div className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 px-4 sm:px-0">{title}</h2>
        <div className="text-gray-500 text-center py-12 text-sm sm:text-base">
          No hay cursos disponibles en esta sección
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 sm:mb-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 px-4 sm:px-0">{title}</h2>
      
      <div className="relative">
        {/* Mobile: Horizontal scroll carousel */}
        {isMobile ? (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {courses.map((course, index) => (
                <div 
                  key={course.podcast.id} 
                  className="flex-none w-[85vw] max-w-[320px] mr-4 first:ml-4 last:mr-4"
                >
                  <CourseCardWithProgress
                    podcast={course.podcast}
                    progress={course.progress}
                    isPlaying={course.isPlaying}
                    isSaved={course.isSaved}
                    showProgress={showProgress}
                    onPlay={() => onPlayCourse?.(course.podcast.id)}
                    onToggleSave={() => onToggleSave?.(course.podcast.id)}
                    onClick={() => onCourseClick?.(course.podcast.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Desktop: Grid layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-0">
            {courses.map((course) => (
              <div key={course.podcast.id} className="h-full">
                <CourseCardWithProgress
                  podcast={course.podcast}
                  progress={course.progress}
                  isPlaying={course.isPlaying}
                  isSaved={course.isSaved}
                  showProgress={showProgress}
                  onPlay={() => onPlayCourse?.(course.podcast.id)}
                  onToggleSave={() => onToggleSave?.(course.podcast.id)}
                  onClick={() => onCourseClick?.(course.podcast.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TouchCarousel;
