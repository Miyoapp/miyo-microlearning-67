
import React from 'react';
import { EmblaCarouselType } from 'embla-carousel';

interface CourseCarouselScrollIndicatorsProps {
  isMobile: boolean;
  coursesLength: number;
  selectedIndex: number;
  emblaApi: EmblaCarouselType | undefined;
}

const CourseCarouselScrollIndicators: React.FC<CourseCarouselScrollIndicatorsProps> = ({
  isMobile,
  coursesLength,
  selectedIndex,
  emblaApi
}) => {
  if (!isMobile || coursesLength <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center mt-4 space-x-2">
      {Array.from({ length: coursesLength }, (_, index) => (
        <button
          key={index}
          className={`w-2 h-2 rounded-full transition-colors ${
            index === selectedIndex 
              ? 'bg-miyo-800' 
              : 'bg-gray-300'
          }`}
          onClick={() => emblaApi?.scrollTo(index)}
        />
      ))}
    </div>
  );
};

export default CourseCarouselScrollIndicators;
