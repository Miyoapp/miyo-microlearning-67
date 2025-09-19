import { useQueryClient } from '@tanstack/react-query';
import { courseKeys } from './useCachedCourses';
import { categoryKeys } from './useCachedCategories';
import { userProgressKeys } from './useCachedUserProgress';
import { obtenerCursoPorIdOptimizado, obtenerCategoriasOptimizado } from '@/lib/api/optimizedCourseAPI';
import { useAuth } from '@/components/auth/AuthProvider';

/**
 * OPTIMIZED: Hook para estrategias de prefetching inteligente
 * Precarga datos que el usuario probablemente necesitará
 */
export const usePrefetchStrategy = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Prefetch course details when user hovers over course card
  const prefetchCourseOnHover = (courseId: string) => {
    queryClient.prefetchQuery({
      queryKey: courseKeys.detail(courseId),
      queryFn: () => obtenerCursoPorIdOptimizado(courseId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Prefetch categories for filters
  const prefetchCategories = () => {
    queryClient.prefetchQuery({
      queryKey: categoryKeys.lists(),
      queryFn: obtenerCategoriasOptimizado,
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  };

  // Prefetch user progress data for authenticated users
  const prefetchUserProgress = () => {
    if (user) {
      queryClient.prefetchQuery({
        queryKey: userProgressKeys.user(user.id),
        queryFn: async () => {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data } = await supabase
            .from('user_course_progress')
            .select('*')
            .eq('user_id', user.id);
          return data || [];
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    }
  };

  // Prefetch dashboard data after login
  const prefetchDashboardData = () => {
    prefetchCategories();
    prefetchUserProgress();
    
    // Also prefetch courses list if not already cached
    queryClient.prefetchQuery({
      queryKey: courseKeys.lists(),
      queryFn: async () => {
        const { obtenerCursosOptimizado } = await import('@/lib/api/optimizedCourseAPI');
        return obtenerCursosOptimizado();
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Preload related courses (same category)
  const prefetchRelatedCourses = (currentCourseId: string, categoryId: string) => {
    // Get courses from same category from cache
    const cachedCourses = queryClient.getQueryData(courseKeys.lists()) as any[];
    if (cachedCourses) {
      const relatedCourses = cachedCourses
        .filter(course => course.category?.id === categoryId && course.id !== currentCourseId)
        .slice(0, 3); // Prefetch top 3 related

      relatedCourses.forEach(course => {
        queryClient.prefetchQuery({
          queryKey: courseKeys.detail(course.id),
          queryFn: () => obtenerCursoPorIdOptimizado(course.id),
          staleTime: 5 * 60 * 1000,
        });
      });
    }
  };

  return {
    prefetchCourseOnHover,
    prefetchCategories,
    prefetchUserProgress,
    prefetchDashboardData,
    prefetchRelatedCourses,
  };
};