import { useCachedCoursesFiltered } from '@/hooks/queries/useCachedCourses';

/**
 * OPTIMIZED: Hook para cursos nuevos que usa caché inteligente
 * Reemplaza useNewCourses con mejor rendimiento
 */
export const useNewCoursesOptimized = () => {
  const { 
    getNewCourses, 
    isLoading: loading,
    error 
  } = useCachedCoursesFiltered();
  
  // Get new courses from cached data (last 4 courses by creation date)
  const newCourses = getNewCourses(4);

  console.log('📊 OPTIMIZED NEW COURSES:', {
    count: newCourses.length,
    loading,
    error: !!error,
    cacheStrategy: 'CACHED_FILTERED'
  });

  return {
    newCourses,
    loading,
    error: error?.message || null,
    refetch: () => {
      console.log('📊 OPTIMIZED: New courses refetch (no-op, using cache)');
    }
  };
};