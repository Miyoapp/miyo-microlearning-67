
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
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-4 sm:px-0">{title}</h2>
        <div className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">
          No hay cursos disponibles en esta sección
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-4 sm:px-0">{title}</h2>
      
      <div className="relative">
        {/* Embla Carousel Container */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {courses.map((course, index) => (
              <div 
                key={course.podcast.id} 
                className={`flex-none ${
                  isMobile 
                    ? 'w-[85%] mr-4 first:ml-4 last:mr-4' 
                    : 'w-[300px] mr-6 first:ml-0'
                }`}
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

        {/* Mobile pagination dots */}
        {isMobile && courses.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: Math.ceil(courses.length) }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === 0 ? 'bg-miyo-800' : 'bg-gray-300'
                }`}
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TouchCarousel;
