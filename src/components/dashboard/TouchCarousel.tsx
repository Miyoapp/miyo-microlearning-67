
import React, { useCallback, useEffect, useState } from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Optimized Embla configuration for better touch handling
  const options: EmblaOptionsType = {
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: false, // Changed from true to false for better control
    skipSnaps: false, // Ensure it stops at cards properly
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      console.log('TouchCarousel: Scrolling to previous slide');
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      console.log('TouchCarousel: Scrolling to next slide');
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    console.log('TouchCarousel: Carousel state updated', {
      canScrollPrev: emblaApi.canScrollPrev(),
      canScrollNext: emblaApi.canScrollNext()
    });
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    console.log('TouchCarousel: Embla API initialized');
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

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

  // Determine when to show navigation arrows
  const shouldShowNavigation = isMobile ? courses.length > 1 : courses.length > 4;

  return (
    <div className="mb-8 sm:mb-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 px-4 sm:px-0">{title}</h2>
      
      <div className="relative">
        {/* Unified carousel structure with optimized touch CSS */}
        <div 
          className="overflow-hidden touch-pan-x" 
          ref={emblaRef}
          style={{ touchAction: 'pan-x' }}
        >
          <div className="flex">
            {courses.map((course) => (
              <div 
                key={course.podcast.id} 
                className={`flex-none ${
                  isMobile 
                    ? 'w-[85vw] max-w-[320px] mr-4 first:ml-4 last:mr-4' 
                    : 'w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 pr-6'
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

        {/* Navigation arrows - unified logic */}
        {shouldShowNavigation && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 bg-white shadow-lg z-10 h-8 w-8 sm:h-10 sm:w-10"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 bg-white shadow-lg z-10 h-8 w-8 sm:h-10 sm:w-10"
              onClick={scrollNext}
              disabled={!canScrollNext}
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TouchCarousel;
