
import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import CourseCardWithProgress from './CourseCardWithProgress';
import { Podcast } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const options: EmblaOptionsType = {
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: true,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
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
      
      <div className="relative px-4 sm:px-0">
        {/* Mobile and Desktop: Embla carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {courses.map((course) => (
                <div 
                  key={course.podcast.id} 
                  className={`flex-none ${
                    isMobile 
                      ? 'w-[85vw] max-w-[320px] mr-4 first:ml-0 last:mr-0' 
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

          {/* Navigation arrows - show when needed */}
          {((isMobile && courses.length > 1) || (!isMobile && courses.length > 4)) && (
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

        {/* Mobile pagination dots */}
        {isMobile && courses.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: courses.length }, (_, index) => (
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

export default CourseCarousel;
