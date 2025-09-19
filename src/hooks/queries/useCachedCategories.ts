import { useQuery } from '@tanstack/react-query';
import { obtenerCategoriasOptimizado } from '@/lib/api/optimizedCourseAPI';
import { CategoryModel } from '@/types';

// Query keys for categories
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
};

/**
 * OPTIMIZED: Hook para obtener categorías con caché eficiente
 * Cache de larga duración ya que las categorías raramente cambian
 */
export const useCachedCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: obtenerCategoriasOptimizado,
    staleTime: 15 * 60 * 1000, // 15 minutes - categories rarely change
    gcTime: 60 * 60 * 1000, // 1 hour - keep in memory longer
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data exists
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};