
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CarouselNavigationArrowsProps {
  isMobile: boolean;
  coursesLength: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
}

const CarouselNavigationArrows: React.FC<CarouselNavigationArrowsProps> = ({
  isMobile,
  coursesLength,
  canScrollPrev,
  canScrollNext,
  scrollPrev,
  scrollNext
}) => {
  return (
    <>
      {/* Mobile navigation arrows - always show both if more than 1 course */}
      {isMobile && coursesLength > 1 && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Left arrow */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-lg z-20 h-8 w-8 border-gray-200 pointer-events-auto"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            style={{ opacity: canScrollPrev ? 1 : 0.3 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Right arrow */}
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-lg z-20 h-8 w-8 border-gray-200 pointer-events-auto"
            onClick={scrollNext}
            disabled={!canScrollNext}
            style={{ opacity: canScrollNext ? 1 : 0.3 }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Desktop navigation arrows - only show when more than 4 courses */}
      {!isMobile && coursesLength > 4 && (
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
    </>
  );
};

export default CarouselNavigationArrows;
