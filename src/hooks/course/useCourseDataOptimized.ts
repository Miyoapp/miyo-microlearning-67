import { useCachedCourse, usePrefetchCourse } from '@/hooks/queries/useCachedCourses';
import { Podcast } from '@/types';

interface UseCourseDataOptimizedResult {
  podcast: Podcast | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

/**
 * OPTIMIZED: Hook para datos de curso que usa caché inteligente
 * Reemplaza useCourseData con mucho mejor rendimiento
 */
export function useCourseDataOptimized(courseId: string | undefined): UseCourseDataOptimizedResult {
  const { 
    data: podcast, 
    isLoading, 
    error, 
    refetch 
  } = useCachedCourse(courseId);
  
  const { prefetchCourse } = usePrefetchCourse();
  
  const retry = () => {
    console.log('🔄 OPTIMIZED: Retrying course fetch for:', courseId);
    refetch();
  };

  // Log performance metrics
  console.log('📊 OPTIMIZED COURSE DATA:', {
    courseId,
    hasPodcast: !!podcast,
    isLoading,
    hasError: !!error,
    cacheHit: podcast && !isLoading ? 'HIT' : 'MISS'
  });

  return {
    podcast: podcast || null,
    isLoading,
    error: error as Error | null,
    retry
  };
}