
import React from 'react';
import { EmblaCarouselType } from 'embla-carousel';

interface CarouselScrollIndicatorsProps {
  isMobile: boolean;
  coursesLength: number;
  selectedIndex: number;
  emblaApi: EmblaCarouselType | undefined;
}

const CarouselScrollIndicators: React.FC<CarouselScrollIndicatorsProps> = ({
  isMobile,
  coursesLength,
  selectedIndex,
  emblaApi
}) => {
  if (!isMobile || coursesLength <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center mt-6 space-x-2">
      {Array.from({ length: coursesLength }, (_, index) => (
        <button
          key={index}
          className={`w-2 h-2 rounded-full transition-all duration-200 ${
            index === selectedIndex 
              ? 'bg-miyo-800 scale-125' 
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          onClick={() => emblaApi?.scrollTo(index)}
        />
      ))}
    </div>
  );
};

export default CarouselScrollIndicators;
