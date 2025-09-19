import { useQuery } from '@tanstack/react-query';
import { useCachedCoursesFiltered } from './useCachedCourses';

/**
 * OPTIMIZED: Hook para obtener cursos nuevos basado en datos cacheados
 * Evita hacer queries adicionales reutilizando datos ya cargados
 */
export const useCachedNewCourses = (limit: number = 4) => {
  const { allCourses, isLoading, error } = useCachedCoursesFiltered();

  return useQuery({
    queryKey: ['newCourses', limit],
    queryFn: () => {
      // OPTIMIZED: Usar datos ya cacheados en lugar de nueva query
      if (!allCourses.length) return [];
      
      // Logic to determine "new" courses
      // 1. Sort by creation date (most recent first)
      // 2. If no creation date info, use reverse order as proxy
      const newCourses = allCourses
        .slice() // Don't mutate original array
        .reverse() // Most recent first (assuming ID order)
        .slice(0, limit);
      
      console.log('📊 OPTIMIZED: Derived new courses from cache:', newCourses.length);
      return newCourses;
    },
    enabled: !!allCourses.length && !isLoading, // Only run when we have cached data
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
};