
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

  const options: EmblaOptionsType = {
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: false, // Cambiado para mejor control
    skipSnaps: false,
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
        {isMobile ? (
          /* Mobile: Touch scrollable carousel */
          <div className="px-4">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {courses.map((course, index) => (
                  <div 
                    key={course.podcast.id} 
                    className="flex-none w-[280px] mr-4"
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
          </div>
        ) : (
          /* Desktop: Grid layout with navigation */
          <div className="relative px-4 lg:px-0">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {courses.map((course) => (
                  <div 
                    key={course.podcast.id} 
                    className="flex-none w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 pr-6"
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

            {/* Desktop navigation arrows */}
            {courses.length > 4 && (
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
          </div>
        )}

        {/* Mobile pagination dots */}
        {isMobile && courses.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {courses.map((_, index) => (
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
