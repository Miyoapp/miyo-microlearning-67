
import { useState, useCallback, useEffect } from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface UseCourseCarouselProps {
  coursesLength: number;
}

export const useCourseCarousel = ({ coursesLength }: UseCourseCarouselProps) => {
  const isMobile = useIsMobile();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Unified Embla configuration optimized for mobile
  const options: EmblaOptionsType = {
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: true, // Better touch handling
    skipSnaps: false,
    startIndex: 0,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options);

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
    setSelectedIndex(emblaApi.selectedScrollSnap());
    console.log('CourseCarousel: Carousel state updated', {
      canScrollPrev: emblaApi.canScrollPrev(),
      canScrollNext: emblaApi.canScrollNext(),
      selectedIndex: emblaApi.selectedScrollSnap(),
      totalSlides: coursesLength
    });
  }, [emblaApi, coursesLength]);

  useEffect(() => {
    if (!emblaApi) return;
    console.log('CourseCarousel: Embla API initialized with', coursesLength, 'courses');
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect, coursesLength]);

  return {
    emblaRef,
    emblaApi,
    canScrollPrev,
    canScrollNext,
    selectedIndex,
    scrollPrev,
    scrollNext,
    isMobile
  };
};
