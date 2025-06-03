
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export interface UserCourseProgress {
  course_id: string;
  progress_percentage: number;
  is_completed: boolean;
  is_saved: boolean;
  last_listened_at: string;
}

export function useUserProgress() {
  const [userProgress, setUserProgress] = useState<UserCourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserProgress(data || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      toast.error('Error al cargar el progreso');
    } finally {
      setLoading(false);
    }
  };

  const updateCourseProgress = async (courseId: string, updates: Partial<UserCourseProgress>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Update local state immediately for better UX
      setUserProgress(prev => {
        const existing = prev.find(p => p.course_id === courseId);
        if (existing) {
          return prev.map(p => 
            p.course_id === courseId 
              ? { ...p, ...updates }
              : p
          );
        } else {
          return [...prev, {
            course_id: courseId,
            progress_percentage: 0,
            is_completed: false,
            is_saved: false,
            last_listened_at: new Date().toISOString(),
            ...updates
          }];
        }
      });
    } catch (error) {
      console.error('Error updating course progress:', error);
      toast.error('Error al actualizar el progreso');
    }
  };

  const toggleSaveCourse = async (courseId: string) => {
    const currentProgress = userProgress.find(p => p.course_id === courseId);
    const newSavedState = !currentProgress?.is_saved;
    
    // Update local state immediately for better UX
    setUserProgress(prev => {
      const existing = prev.find(p => p.course_id === courseId);
      if (existing) {
        return prev.map(p => 
          p.course_id === courseId 
            ? { ...p, is_saved: newSavedState }
            : p
        );
      } else {
        return [...prev, {
          course_id: courseId,
          progress_percentage: 0,
          is_completed: false,
          is_saved: newSavedState,
          last_listened_at: new Date().toISOString()
        }];
      }
    });
    
    await updateCourseProgress(courseId, { is_saved: newSavedState });
    toast.success(newSavedState ? 'Curso guardado' : 'Curso removido de guardados');
  };

  const startCourse = async (courseId: string) => {
    // When a user starts a course, update their progress to show it in "Continue Learning"
    await updateCourseProgress(courseId, { 
      progress_percentage: 1, // Small progress to show it started
      last_listened_at: new Date().toISOString()
    });
  };

  useEffect(() => {
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  return {
    userProgress,
    loading,
    updateCourseProgress,
    toggleSaveCourse,
    startCourse,
    refetch: fetchUserProgress
  };
}
