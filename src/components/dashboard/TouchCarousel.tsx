
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

  // Optimized Embla configuration for mobile touch
  const options: EmblaOptionsType = {
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: true, // Better for touch on mobile
    skipSnaps: false,
    startIndex: 0,
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
      canScrollNext: emblaApi.canScrollNext(),
      selectedIndex: emblaApi.selectedScrollSnap(),
      totalSlides: emblaApi.scrollSnapList().length
    });
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    console.log('TouchCarousel: Embla API initialized with', courses.length, 'courses');
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect, courses.length]);

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

  // Show navigation for mobile when more than 1 course, desktop when more than 4
  const shouldShowNavigation = isMobile ? courses.length > 1 : courses.length > 4;

  return (
    <div className="mb-8 sm:mb-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 px-4 sm:px-0">{title}</h2>
      
      <div className="relative">
        {/* Mobile-optimized carousel container */}
        <div 
          className="overflow-hidden cursor-grab active:cursor-grabbing" 
          ref={emblaRef}
          style={{ 
            touchAction: 'pan-x pinch-zoom',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex touch-pan-x">
            {courses.map((course, index) => (
              <div 
                key={course.podcast.id} 
                className={`flex-none ${
                  isMobile 
                    ? 'w-[280px] min-w-[280px] mr-4 first:ml-4 last:mr-4' 
                    : 'w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 pr-6'
                }`}
                style={{ 
                  flex: isMobile ? '0 0 280px' : undefined
                }}
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

        {/* Navigation arrows - only show on desktop or when really needed */}
        {shouldShowNavigation && !isMobile && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg z-10 h-10 w-10"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg z-10 h-10 w-10"
              onClick={scrollNext}
              disabled={!canScrollNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Mobile scroll indicator dots */}
        {isMobile && courses.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {courses.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === (emblaApi?.selectedScrollSnap() || 0) 
                    ? 'bg-miyo-800' 
                    : 'bg-gray-300'
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
