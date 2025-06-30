
import React from 'react';
import CourseCardWithProgress from './CourseCardWithProgress';
import { Podcast } from '@/types';
import { useCourseCarousel } from './carousel/useCourseCarousel';
import CourseCarouselNavigationArrows from './carousel/CourseCarouselNavigationArrows';
import CourseCarouselScrollIndicators from './carousel/CourseCarouselScrollIndicators';

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
  const {
    emblaRef,
    emblaApi,
    canScrollPrev,
    canScrollNext,
    selectedIndex,
    scrollPrev,
    scrollNext,
    isMobile
  } = useCourseCarousel({ coursesLength: courses.length });

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
        <div className="relative">
          <div 
            className="overflow-hidden cursor-grab active:cursor-grabbing" 
            ref={emblaRef}
            style={{ 
              touchAction: 'pan-x pinch-zoom',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex touch-pan-x">
              {courses.map((course) => (
                <div 
                  key={course.podcast.id} 
                  className={`flex-none ${
                    isMobile 
                      ? 'w-[280px] min-w-[280px] mr-4 first:ml-0 last:mr-0' 
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

          <CourseCarouselNavigationArrows
            isMobile={isMobile}
            coursesLength={courses.length}
            canScrollPrev={canScrollPrev}
            canScrollNext={canScrollNext}
            scrollPrev={scrollPrev}
            scrollNext={scrollNext}
          />
        </div>

        <CourseCarouselScrollIndicators
          isMobile={isMobile}
          coursesLength={courses.length}
          selectedIndex={selectedIndex}
          emblaApi={emblaApi}
        />
      </div>
    </div>
  );
};

export default CourseCarousel;
