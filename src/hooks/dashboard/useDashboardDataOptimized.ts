import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useCachedCoursesFiltered } from '@/hooks/queries/useCachedCourses';
import { useCachedProgressData, useToggleSaveCourse } from '@/hooks/queries/useCachedUserProgress';

interface UserProfile {
  name: string;
  created_at: string;
}

/**
 * OPTIMIZED: Hook para datos del dashboard que usa caché inteligente
 * Reemplaza useDashboardData con solo 2 queries optimizadas en lugar de 36+
 */
export const useDashboardDataOptimized = () => {
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>('');
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(false);
  
  // OPTIMIZED: Single query for all courses with cache
  const { 
    allCourses, 
    getFreeCourses, 
    getPremiumCourses,
    isLoading: coursesLoading,
    error: coursesError 
  } = useCachedCoursesFiltered();
  
  // OPTIMIZED: Cached user progress
  const { 
    userProgress, 
    getContinueLearningCourses,
    isLoading: progressLoading,
    refetch: refetchProgress 
  } = useCachedProgressData();
  
  // OPTIMIZED: Cached mutations
  const toggleSaveCourseMutation = useToggleSaveCourse();

  // Load user profile data (lightweight query)
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, created_at')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setUserName(profile.name || user.email || 'Usuario');
            
            // Determinar si es primera vez basado en si se creó hoy
            const createdDate = new Date(profile.created_at);
            const today = new Date();
            const isToday = createdDate.toDateString() === today.toDateString();
            setIsFirstTimeUser(isToday);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUserName(user.email || 'Usuario');
        }
      }
    };

    loadUserData();
  }, [user]);

  // Calculate derived data using cached functions
  const continueLearningCourses = getContinueLearningCourses(allCourses);
  const freeCourses = getFreeCourses().map(course => {
    const progress = userProgress.find(p => p.course_id === course.id);
    return {
      podcast: course,
      progress: progress?.progress_percentage || 0,
      isPlaying: false,
      isSaved: progress?.is_saved || false
    };
  });
  const premiumCourses = getPremiumCourses().map(course => {
    const progress = userProgress.find(p => p.course_id === course.id);
    return {
      podcast: course,
      progress: progress?.progress_percentage || 0,
      isPlaying: false,
      isSaved: progress?.is_saved || false
    };
  });

  const toggleSaveCourse = async (courseId: string) => {
    console.log('📊 OPTIMIZED: Toggling save for course:', courseId);
    await toggleSaveCourseMutation.mutateAsync(courseId);
  };

  const loading = coursesLoading || progressLoading;
  const error = coursesError;

  console.log('📊 OPTIMIZED DASHBOARD DATA:', {
    allCoursesCount: allCourses.length,
    continueLearningCount: continueLearningCourses.length,
    freeCoursesCount: freeCourses.length,
    premiumCoursesCount: premiumCourses.length,
    userProgressCount: userProgress.length,
    loading,
    error: !!error
  });

  return {
    allCourses,
    continueLearningCourses,
    freeCourses,
    premiumCourses,
    loading,
    error,
    userName,
    isFirstTimeUser,
    userProgress,
    toggleSaveCourse,
    refetch: refetchProgress,
  };
};