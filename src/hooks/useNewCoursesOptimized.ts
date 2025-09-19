import { useCachedNewCourses } from '@/hooks/queries/useCachedNewCourses';

/**
 * OPTIMIZED: Replacement for useNewCourses using cached data
 * Uses cached courses instead of making direct database queries
 */
export const useNewCoursesOptimized = (limit: number = 4) => {
  const { data: newCourses = [], isLoading, error } = useCachedNewCourses(limit);
  
  const refetch = () => {
    // For cached data, refetch is handled by the underlying query
    console.log('📊 OPTIMIZED: Refetch triggered for new courses');
  };

  return {
    newCourses,
    loading: isLoading,
    error: error ? 'Error al cargar cursos nuevos' : null,
    refetch,
  };
};