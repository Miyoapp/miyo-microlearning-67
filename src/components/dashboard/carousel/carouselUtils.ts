
import { EmblaOptionsType } from 'embla-carousel';
import { useIsMobile } from '@/hooks/use-mobile';

export interface CarouselItem {
  podcast: any;
  progress?: number;
  isPlaying?: boolean;
  isSaved?: boolean;
}

export interface PlaceholderItem {
  isPlaceholder: boolean;
  id: string;
}

export type DisplayItem = CarouselItem | PlaceholderItem;

// Type guard to check if an item is a placeholder
export const isPlaceholderItem = (item: any): item is PlaceholderItem => {
  return item && typeof item === 'object' && 'isPlaceholder' in item && item.isPlaceholder === true;
};

// Generate placeholder items for better mobile scrolling
export const generatePlaceholders = (count: number): PlaceholderItem[] => {
  return Array(count).fill(null).map((_, index) => ({
    isPlaceholder: true,
    id: `placeholder-${index}`
  }));
};

// Get display courses with placeholders for mobile
export const getDisplayCourses = (courses: CarouselItem[], isMobile: boolean): DisplayItem[] => {
  if (!isMobile || courses.length >= 4) {
    return courses;
  }
  
  const placeholdersNeeded = Math.max(0, 4 - courses.length);
  const placeholders = generatePlaceholders(placeholdersNeeded);
  
  return [...courses, ...placeholders];
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

// Get mobile card width based on course count
export const getMobileCardWidth = (courseCount: number): string => {
  if (courseCount <= 2) {
    return 'w-[92vw]';
  } else if (courseCount === 3) {
    return 'w-[88vw]';
  }
  return 'w-[85vw]';
};

// Determine if navigation should be shown
export const shouldShowNavigation = (displayCount: number, isMobile: boolean): boolean => {
  return !isMobile && displayCount > 4;
};
