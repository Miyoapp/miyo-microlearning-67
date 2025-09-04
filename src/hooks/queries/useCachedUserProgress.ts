import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { UserCourseProgress } from '@/hooks/user-progress/types';

// Query keys for user progress cache management
export const userProgressKeys = {
  all: ['userProgress'] as const,
  user: (userId: string) => [...userProgressKeys.all, userId] as const,
};

/**
 * OPTIMIZED: Hook para obtener progreso de usuario con caché
 */
export const useCachedUserProgress = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: userProgressKeys.user(user?.id || ''),
    queryFn: async (): Promise<UserCourseProgress[]> => {
      if (!user) {
        console.log('📊 CACHED: No user found, returning empty progress');
        return [];
      }

      console.log('📊 CACHED: Fetching user progress for:', user.id);
      
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ CACHED: Error fetching user progress:', error);
        throw error;
      }

      const progressData = data || [];
      console.log('📊 CACHED: Fetched user progress:', {
        totalRecords: progressData.length,
        courses: progressData.map(p => ({ courseId: p.course_id, progress: p.progress_percentage }))
      });

      return progressData;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent updates for user data
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * OPTIMIZED: Mutation para actualizar progreso con invalidación de caché
 */
export const useUpdateCourseProgress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ courseId, updates }: { 
      courseId: string; 
      updates: Partial<UserCourseProgress> 
    }) => {
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Update cache optimistically
      queryClient.setQueryData(
        userProgressKeys.user(user?.id || ''), 
        (oldData: UserCourseProgress[] | undefined) => {
          if (!oldData) return [data];
          
          const existingIndex = oldData.findIndex(p => p.course_id === data.course_id);
          if (existingIndex >= 0) {
            const newData = [...oldData];
            newData[existingIndex] = data;
            return newData;
          } else {
            return [...oldData, data];
          }
        }
      );
    },
    onError: (error) => {
      console.error('❌ Error updating course progress:', error);
      toast.error('Error al actualizar progreso');
    },
  });
};

/**
 * OPTIMIZED: Mutation para toggle save course
 */
export const useToggleSaveCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error('Usuario no autenticado');

      // Get current save status
      const { data: currentProgress } = await supabase
        .from('user_course_progress')
        .select('is_saved')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      const newSavedStatus = !currentProgress?.is_saved;

      const { data, error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          is_saved: newSavedStatus,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Update cache optimistically
      queryClient.setQueryData(
        userProgressKeys.user(user?.id || ''), 
        (oldData: UserCourseProgress[] | undefined) => {
          if (!oldData) return [data];
          
          const existingIndex = oldData.findIndex(p => p.course_id === data.course_id);
          if (existingIndex >= 0) {
            const newData = [...oldData];
            newData[existingIndex] = data;
            return newData;
          } else {
            return [...oldData, data];
          }
        }
      );
      
      toast.success(data.is_saved ? 'Curso guardado' : 'Curso removido de guardados');
    },
    onError: (error) => {
      console.error('❌ Error toggling save status:', error);
      toast.error('Error al guardar curso');
    },
  });
};

/**
 * OPTIMIZED: Hook para obtener datos derivados del progreso
 */
export const useCachedProgressData = () => {
  const { data: userProgress = [], ...query } = useCachedUserProgress();

  const getContinueLearningCourses = (allCourses: any[]) => {
    return allCourses
      .map(course => {
        const progress = userProgress.find(p => p.course_id === course.id);
        const progressPercentage = progress?.progress_percentage || 0;
        return {
          podcast: course,
          progress: progressPercentage,
          isPlaying: false,
          isSaved: progress?.is_saved || false
        };
      })
      .filter(course => course.progress > 0 && course.progress < 100);
  };

  const getSavedCourses = (allCourses: any[]) => {
    return allCourses.filter(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return progress?.is_saved || false;
    });
  };

  const getCompletedCourses = (allCourses: any[]) => {
    return allCourses.filter(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return progress?.is_completed || false;
    });
  };

  const getCourseProgress = (courseId: string) => {
    return userProgress.find(p => p.course_id === courseId) || null;
  };

  return {
    userProgress,
    getContinueLearningCourses,
    getSavedCourses,
    getCompletedCourses,
    getCourseProgress,
    ...query,
  };
};