
import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useIsMobile } from '@/hooks/use-mobile';
import CourseCardWithProgress from '../CourseCardWithProgress';
import PlaceholderCourseCard from '../PlaceholderCourseCard';
import CarouselNavigation from './CarouselNavigation';
import {
  DisplayItem,
  isPlaceholderItem,
  getDisplayCourses,
  getEmblaOptions,
  getMobileCardWidth,
  shouldShowNavigation,
  CarouselItem
} from './carouselUtils';

interface CarouselContainerProps {
  courses: CarouselItem[];
  showProgress?: boolean;
  onPlayCourse?: (courseId: string) => void;
  onToggleSave?: (courseId: string) => void;
  onCourseClick?: (courseId: string) => void;
  containerClassName?: string;
}

const CarouselContainer: React.FC<CarouselContainerProps> = ({
  courses,
  showProgress = true,
  onPlayCourse,
  onToggleSave,
  onCourseClick,
  containerClassName = ""
}) => {
  const isMobile = useIsMobile();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const displayCourses = getDisplayCourses(courses, isMobile);
  const [emblaRef, emblaApi] = useEmblaCarousel(getEmblaOptions(courses.length));

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      console.log('Carousel: Scrolling to previous slide');
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      console.log('Carousel: Scrolling to next slide');
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    console.log('Carousel: State updated', {
      canScrollPrev: emblaApi.canScrollPrev(),
      canScrollNext: emblaApi.canScrollNext(),
      selectedIndex: emblaApi.selectedScrollSnap(),
      totalSlides: courses.length
    });
  }, [emblaApi, courses.length]);

  useEffect(() => {
    if (!emblaApi) return;
    console.log('Carousel: Embla API initialized with', courses.length, 'courses');
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
      <div className="text-gray-500 text-center py-12 text-sm sm:text-base">
        No hay cursos disponibles en esta sección
      </div>
    );
  }

  const showNav = shouldShowNavigation(displayCourses.length, isMobile);

  return (
    <div className={`relative overflow-x-hidden ${containerClassName}`}>
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
                  ? `${getMobileCardWidth(courses.length)} px-2` 
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

      {showNav && (
        <CarouselNavigation
          onScrollPrev={scrollPrev}
          onScrollNext={scrollNext}
          canScrollPrev={canScrollPrev}
          canScrollNext={canScrollNext}
        />
      )}
    </div>
  );
};

export default CarouselContainer;
