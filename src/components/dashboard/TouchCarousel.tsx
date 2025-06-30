
import React from 'react';
import CourseCardWithProgress from './CourseCardWithProgress';
import { Podcast } from '@/types';
import { useTouchCarousel } from './carousel/useTouchCarousel';
import CarouselNavigationArrows from './carousel/CarouselNavigationArrows';
import CarouselScrollIndicators from './carousel/CarouselScrollIndicators';

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
  const {
    emblaRef,
    emblaApi,
    canScrollPrev,
    canScrollNext,
    selectedIndex,
    scrollPrev,
    scrollNext,
    isMobile
  } = useTouchCarousel({ coursesLength: courses.length });

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
        {/* Mobile-optimized carousel container with snap */}
        <div 
          className="overflow-hidden cursor-grab active:cursor-grabbing" 
          ref={emblaRef}
          style={{ 
            touchAction: 'pan-x pinch-zoom',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className={`flex ${isMobile ? 'snap-x snap-mandatory' : ''}`}>
            {courses.map((course) => (
              <div 
                key={course.podcast.id} 
                className={`flex-none ${
                  isMobile 
                    ? 'w-[90vw] max-w-[320px] px-4 snap-center snap-always' 
                    : 'w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 pr-6'
                }`}
                style={{ 
                  flex: isMobile ? '0 0 90vw' : undefined,
                  maxWidth: isMobile ? '320px' : undefined
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

        <CarouselNavigationArrows
          isMobile={isMobile}
          coursesLength={courses.length}
          canScrollPrev={canScrollPrev}
          canScrollNext={canScrollNext}
          scrollPrev={scrollPrev}
          scrollNext={scrollNext}
        />

        <CarouselScrollIndicators
          isMobile={isMobile}
          coursesLength={courses.length}
          selectedIndex={selectedIndex}
          emblaApi={emblaApi}
        />
      </div>
    </div>
  );
};

export default TouchCarousel;
