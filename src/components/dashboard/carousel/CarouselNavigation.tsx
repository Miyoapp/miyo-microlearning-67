
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CarouselNavigationProps {
  onScrollPrev: () => void;
  onScrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

const CarouselNavigation: React.FC<CarouselNavigationProps> = ({
  onScrollPrev,
  onScrollNext,
  canScrollPrev,
  canScrollNext
}) => {
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-3 bg-white shadow-lg z-10 h-8 w-8 sm:h-10 sm:w-10"
        onClick={onScrollPrev}
        disabled={!canScrollPrev}
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 bg-white shadow-lg z-10 h-8 w-8 sm:h-10 sm:w-10"
        onClick={onScrollNext}
        disabled={!canScrollNext}
      >
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </>
  );
};

export default CarouselNavigation;
