import { useEffect } from 'react';
import { usePrefetchCourse } from '@/hooks/queries/useCachedCourses';
import { Podcast } from '@/types';

interface UseDashboardPrefetchProps {
  continueLearningCourses: Array<{ podcast: Podcast }>;
  freeCourses: Array<{ podcast: Podcast }>;
  premiumCourses: Array<{ podcast: Podcast }>;
}

/**
 * OPTIMIZED: Hook para prefetch inteligente de cursos populares
 * Precarga cursos que el usuario probablemente visitará
 */
export function useDashboardPrefetch({
  continueLearningCourses,
  freeCourses,
  premiumCourses
}: UseDashboardPrefetchProps) {
  const { prefetchCourse } = usePrefetchCourse();

  useEffect(() => {
    const prefetchPriorityCourses = () => {
      console.log('🚀 PREFETCH: Starting intelligent course prefetching');
      
      // HIGHEST PRIORITY: Continue learning courses (user is actively engaged)
      continueLearningCourses.slice(0, 2).forEach(({ podcast }) => {
        console.log('🎯 PREFETCH: High priority (continue learning):', podcast.title);
        prefetchCourse(podcast.id);
      });
      
      // MEDIUM PRIORITY: First 2 free courses (likely to be explored)
      freeCourses.slice(0, 2).forEach(({ podcast }) => {
        console.log('🆓 PREFETCH: Medium priority (free course):', podcast.title);
        prefetchCourse(podcast.id);
      });
      
      // LOW PRIORITY: First premium course (if user explores premium)
      if (premiumCourses.length > 0) {
        console.log('💎 PREFETCH: Low priority (premium course):', premiumCourses[0].podcast.title);
        prefetchCourse(premiumCourses[0].podcast.id);
      }
    };

    // Debounced prefetch to avoid overwhelming the network
    const timeoutId = setTimeout(prefetchPriorityCourses, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [
    continueLearningCourses.length,
    freeCourses.length,
    premiumCourses.length,
    prefetchCourse
  ]);

  // Prefetch on hover (aggressive optimization)
  const prefetchOnHover = (courseId: string) => {
    console.log('🖱️ PREFETCH: Hover triggered for course:', courseId);
    prefetchCourse(courseId);
  };

  return { prefetchOnHover };
}