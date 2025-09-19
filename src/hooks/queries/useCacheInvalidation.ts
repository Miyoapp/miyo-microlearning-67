import { useQueryClient } from '@tanstack/react-query';
import { courseKeys } from './useCachedCourses';
import { categoryKeys } from './useCachedCategories';
import { userProgressKeys } from './useCachedUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';

/**
 * OPTIMIZED: Hook para manejo inteligente de invalidación de caché
 * Invalida solo los datos necesarios para mantener performance
 */
export const useCacheInvalidation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Invalidate all courses (use sparingly)
  const invalidateAllCourses = () => {
    console.log('🗑️ CACHE: Invalidating all courses');
    queryClient.invalidateQueries({ queryKey: courseKeys.all });
  };

  // Invalidate specific course
  const invalidateCourse = (courseId: string) => {
    console.log('🗑️ CACHE: Invalidating course:', courseId);
    queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
  };

  // Invalidate user progress
  const invalidateUserProgress = () => {
    if (user) {
      console.log('🗑️ CACHE: Invalidating user progress');
      queryClient.invalidateQueries({ queryKey: userProgressKeys.user(user.id) });
    }
  };

  // Invalidate categories (rarely needed)
  const invalidateCategories = () => {
    console.log('🗑️ CACHE: Invalidating categories');
    queryClient.invalidateQueries({ queryKey: categoryKeys.all });
  };

  // Smart invalidation after course completion
  const invalidateAfterCourseCompletion = (courseId: string) => {
    console.log('🗑️ CACHE: Smart invalidation after course completion');
    invalidateUserProgress();
    invalidateCourse(courseId);
  };

  // Smart invalidation after course purchase
  const invalidateAfterCoursePurchase = (courseId: string) => {
    console.log('🗑️ CACHE: Smart invalidation after course purchase');
    invalidateUserProgress();
    invalidateCourse(courseId);
  };

  // Clear all cache (nuclear option)
  const clearAllCache = () => {
    console.log('🗑️ CACHE: Clearing ALL cache (nuclear option)');
    queryClient.clear();
  };

  // Get cache statistics
  const getCacheStats = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      cacheSize: JSON.stringify(queries).length, // Approximate size
    };
  };

  return {
    invalidateAllCourses,
    invalidateCourse,
    invalidateUserProgress,
    invalidateCategories,
    invalidateAfterCourseCompletion,
    invalidateAfterCoursePurchase,
    clearAllCache,
    getCacheStats,
  };
};