
import { EmblaOptionsType } from 'embla-carousel';

export interface CarouselItem {
  podcast: any;
  progress?: number;
  isPlaying?: boolean;
  isSaved?: boolean;
}

// Get display courses - now returns only real courses
export const getDisplayCourses = (courses: CarouselItem[], isMobile: boolean): CarouselItem[] => {
  return courses;
};

// Dynamic Embla configuration based on course count
export const getEmblaOptions = (courseCount: number): EmblaOptionsType => {
  const hasFewerCards = courseCount <= 3;
  
  return {
    align: hasFewerCards ? 'start' : 'center',
    slidesToScroll: 1,
    containScroll: 'keepSnaps',
    dragFree: false,
    skipSnaps: false,
    loop: false,
    watchDrag: true,
    inViewThreshold: 0.8,
  };
};

// Get mobile card width based on course count - optimized for real courses only
export const getMobileCardWidth = (courseCount: number): string => {
  if (courseCount === 1) {
    return 'w-[90vw]';
  } else if (courseCount === 2) {
    return 'w-[75vw]';
  } else if (courseCount === 3) {
    return 'w-[65vw]';
  }
  return 'w-[75vw]';
};

// Determine if navigation should be shown
export const shouldShowNavigation = (displayCount: number, isMobile: boolean): boolean => {
  return !isMobile && displayCount > 4;
};
