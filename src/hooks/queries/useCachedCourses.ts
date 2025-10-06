import { useQuery, useQueryClient } from '@tanstack/react-query';
import { obtenerCursosOptimizado, obtenerCursoPorIdOptimizado } from '@/lib/api/optimizedCourseAPI';
import { Podcast } from '@/types';

// Helper function to add timeout to queries
const createQueryWithTimeout = <T,>(
  queryFn: () => Promise<T>,
  timeoutMs: number = 15000 // 15 seconds default
): (() => Promise<T>) => {
  return () => {
    return Promise.race([
      queryFn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout - please check your connection')), timeoutMs)
      )
    ]);
  };
};

// Query keys for cache management
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...courseKeys.lists(), { filters }] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
};

/**
 * OPTIMIZED: Hook para obtener todos los cursos con caché inteligente
 * Reemplaza las múltiples llamadas a obtenerCursos() sin optimización
 */
export const useCachedCourses = () => {
  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: createQueryWithTimeout(obtenerCursosOptimizado, 15000),
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * OPTIMIZED: Hook para obtener un curso específico con caché
 */
export const useCachedCourse = (courseId: string | undefined) => {
  return useQuery({
    queryKey: courseKeys.detail(courseId || ''),
    queryFn: createQueryWithTimeout(() => obtenerCursoPorIdOptimizado(courseId!), 15000),
    enabled: !!courseId, // Only run if courseId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * OPTIMIZED: Hook para prefetch de curso
 * Útil para precargar cursos que el usuario probablemente visitará
 */
export const usePrefetchCourse = () => {
  const queryClient = useQueryClient();

  const prefetchCourse = (courseId: string) => {
    queryClient.prefetchQuery({
      queryKey: courseKeys.detail(courseId),
      queryFn: createQueryWithTimeout(() => obtenerCursoPorIdOptimizado(courseId), 15000),
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetchCourse };
};

/**
 * OPTIMIZED: Hook para invalidar caché de cursos
 * Útil cuando hay actualizaciones que requieren refetch
 */
export const useInvalidateCourses = () => {
  const queryClient = useQueryClient();

  const invalidateAllCourses = () => {
    queryClient.invalidateQueries({ queryKey: courseKeys.all });
  };

  const invalidateCourse = (courseId: string) => {
    queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
  };

  const updateCourseInCache = (courseId: string, updater: (oldData: Podcast | undefined) => Podcast | undefined) => {
    queryClient.setQueryData(courseKeys.detail(courseId), updater);
    
    // Also update the course in the courses list
    queryClient.setQueryData(courseKeys.lists(), (oldData: Podcast[] | undefined) => {
      if (!oldData) return oldData;
      return oldData.map(course => 
        course.id === courseId ? updater(course) || course : course
      );
    });
  };

  return {
    invalidateAllCourses,
    invalidateCourse,
    updateCourseInCache,
  };
};

/**
 * OPTIMIZED: Filtros derivados para cursos cacheados
 * Evita re-fetching cuando solo necesitamos filtrar datos existentes
 */
export const useCachedCoursesFiltered = () => {
  const { data: allCourses, ...query } = useCachedCourses();

  const getFreeCourses = () => {
    return allCourses?.filter(course => course.tipo_curso === 'libre').slice(0, 4) || [];
  };

  const getPremiumCourses = () => {
    return allCourses?.filter(course => course.tipo_curso === 'pago').slice(0, 6) || [];
  };

  const getCoursesByCategory = (categoryId: string) => {
    return allCourses?.filter(course => course.category.id === categoryId) || [];
  };

  const getNewCourses = (limit: number = 4) => {
    // Sort by creation date (assuming it's stored in a field we have access to)
    // For now, we'll sort by ID as a proxy for creation order
    return allCourses
      ?.slice()
      .reverse() // Most recent first
      .slice(0, limit) || [];
  };

  return {
    allCourses: allCourses || [],
    getFreeCourses,
    getPremiumCourses,
    getCoursesByCategory,
    getNewCourses,
    ...query,
  };
};