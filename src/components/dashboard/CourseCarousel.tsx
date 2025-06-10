
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();
  
  // Mobile: 1 card, Tablet: 2 cards, Desktop: 3 cards
  const itemsPerPage = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, courses.length - itemsPerPage);
  
  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };
  
  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

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
        {/* Mobile: Single column layout */}
        {isMobile ? (
          <div className="space-y-4">
            {courses.slice(currentIndex, currentIndex + 1).map((course) => (
              <CourseCardWithProgress
                key={course.podcast.id}
                podcast={course.podcast}
                progress={course.progress}
                isPlaying={course.isPlaying}
                isSaved={course.isSaved}
                showProgress={showProgress}
                onPlay={() => onPlayCourse?.(course.podcast.id)}
                onToggleSave={() => onToggleSave?.(course.podcast.id)}
                onClick={() => onCourseClick?.(course.podcast.id)}
              />
            ))}
          </div>
        ) : (
          /* Desktop: Carousel layout */
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
                width: `${courses.length / itemsPerPage * 100}%`
              }}
            >
              {courses.map((course, index) => (
                <div 
                  key={course.podcast.id} 
                  className="flex-shrink-0"
                  style={{ width: `${100 / courses.length}%` }}
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
        )}

        {/* Navigation arrows - only show when needed */}
        {courses.length > itemsPerPage && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 bg-white shadow-lg z-10 h-8 w-8 sm:h-10 sm:w-10"
              onClick={prevSlide}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 bg-white shadow-lg z-10 h-8 w-8 sm:h-10 sm:w-10"
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </>
        )}

        {/* Mobile pagination dots */}
        {isMobile && courses.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {courses.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-miyo-800' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCarousel;
