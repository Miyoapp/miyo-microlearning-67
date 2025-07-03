
import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import CourseCardWithProgress from './CourseCardWithProgress';
import { Podcast } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import PlaceholderCourseCard from './PlaceholderCourseCard';

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

// Type guard to check if an item is a placeholder
const isPlaceholderItem = (item: any): item is { isPlaceholder: boolean; id: string } => {
  return item && typeof item === 'object' && 'isPlaceholder' in item && item.isPlaceholder === true;
};

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

  // Add placeholder cards to ensure smooth scrolling on mobile
  const getDisplayCourses = () => {
    if (!isMobile || courses.length >= 4) {
      return courses;
    }
    
    // Add placeholder cards to reach at least 4 items for better scroll behavior
    const placeholdersNeeded = Math.max(0, 4 - courses.length);
    const placeholders = Array(placeholdersNeeded).fill(null).map((_, index) => ({
      isPlaceholder: true,
      id: `placeholder-${index}`
    }));
    
    return [...courses, ...placeholders];
  };

  const displayCourses = getDisplayCourses();

  // Configuración dinámica basada en el número de tarjetas
  const getEmblaOptions = (): EmblaOptionsType => {
    const hasFewerCards = courses.length <= 3;
    
    return {
      align: hasFewerCards ? 'start' : 'center', // start para pocas tarjetas, center para muchas
      slidesToScroll: 1,
      containScroll: 'keepSnaps',
      dragFree: false,
      skipSnaps: false,
      loop: false,
      watchDrag: true,
      inViewThreshold: 0.8, // Aumentamos el threshold para mejor detección
    };
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(getEmblaOptions());

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      console.log('CourseCarousel: Scrolling to previous slide');
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      console.log('CourseCarousel: Scrolling to next slide');
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    console.log('CourseCarousel: Carousel state updated', {
      canScrollPrev: emblaApi.canScrollPrev(),
      canScrollNext: emblaApi.canScrollNext(),
      selectedIndex: emblaApi.selectedScrollSnap(),
      totalSlides: courses.length
    });
  }, [emblaApi, courses.length]);

  useEffect(() => {
    if (!emblaApi) return;
    console.log('CourseCarousel: Embla API initialized with', courses.length, 'courses');
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

  // Lógica de ancho dinámico para móvil
  const getMobileCardWidth = () => {
    if (courses.length <= 2) {
      return 'w-[92vw]'; // Más ancho para aprovechar el espacio con pocas tarjetas
    } else if (courses.length === 3) {
      return 'w-[88vw]'; // Ancho intermedio
    }
    return 'w-[85vw]'; // Ancho estándar para 4+ tarjetas
  };

  // Unified navigation logic
  const shouldShowNavigation = isMobile ? displayCourses.length > 1 : displayCourses.length > 4;

  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-4 sm:px-0">{title}</h2>
      
      <div className="relative px-4 sm:px-0">
        {/* Enhanced carousel with optimized scroll snap */}
        <div className="relative">
          <div 
            className="overflow-hidden" 
            ref={emblaRef}
            style={{ 
              touchAction: 'pan-x',
              overscrollBehaviorX: 'contain',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth'
            }}
          >
            <div className="flex">
              {displayCourses.map((item, index) => (
                <div 
                  key={isPlaceholderItem(item) ? item.id : item.podcast.id}
                  className={`flex-none ${
                    isMobile 
                      ? `${getMobileCardWidth()} px-2` 
                      : 'w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 pr-6'
                  }`}
                  style={isMobile ? { 
                    scrollSnapAlign: courses.length <= 3 ? 'start' : 'center',
                    scrollSnapStop: 'always'
                  } : {}}
                >
                  {isPlaceholderItem(item) ? (
                    <PlaceholderCourseCard />
                  ) : (
                    <CourseCardWithProgress
                      podcast={item.podcast}
                      progress={item.progress}
                      isPlaying={item.isPlaying}
                      isSaved={item.isSaved}
                      showProgress={showProgress}
                      onPlay={() => onPlayCourse?.(item.podcast.id)}
                      onToggleSave={() => onToggleSave?.(item.podcast.id)}
                      onClick={() => onCourseClick?.(item.podcast.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
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
    </div>
  );
};

export default CourseCarousel;
