
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
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user progress:', error);
        throw error;
      }
      
      console.log('Fetched user progress from DB:', data);
      setUserProgress(data || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      toast.error('Error al cargar el progreso');
    } finally {
      setLoading(false);
    }
  };

  const updateCourseProgress = async (courseId: string, updates: Partial<UserCourseProgress>) => {
    if (!user) {
      console.log('No user found, cannot update progress');
      return;
    }

    console.log('Updating course progress for:', courseId, 'with updates:', updates);

    try {
      const { data, error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          progress_percentage: 0,
          is_completed: false,
          is_saved: false,
          last_listened_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...updates
        }, {
          onConflict: 'user_id,course_id'
        })
        .select();

      if (error) {
        console.error('Error updating course progress:', error);
        throw error;
      }
      
      console.log('Successfully updated course progress in DB:', data);
      
      // Update local state immediately for better UX
      setUserProgress(prev => {
        const existing = prev.find(p => p.course_id === courseId);
        const updatedProgress = {
          course_id: courseId,
          progress_percentage: 0,
          is_completed: false,
          is_saved: false,
          last_listened_at: new Date().toISOString(),
          ...(existing || {}),
          ...updates
        };
        
        if (existing) {
          const newProgress = prev.map(p => 
            p.course_id === courseId 
              ? updatedProgress
              : p
          );
          console.log('Updated local progress state:', newProgress);
          return newProgress;
        } else {
          const newProgress = [...prev, updatedProgress];
          console.log('Added new progress to local state:', newProgress);
          return newProgress;
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
    
    console.log('Toggling save for course:', courseId, 'from', currentProgress?.is_saved, 'to', newSavedState);
    
    // Update local state immediately for better UX
    setUserProgress(prev => {
      const existing = prev.find(p => p.course_id === courseId);
      if (existing) {
        const updated = prev.map(p => 
          p.course_id === courseId 
            ? { ...p, is_saved: newSavedState }
            : p
        );
        console.log('Updated local state for save toggle:', updated);
        return updated;
      } else {
        const newEntry = {
          course_id: courseId,
          progress_percentage: 0,
          is_completed: false,
          is_saved: newSavedState,
          last_listened_at: new Date().toISOString()
        };
        console.log('Created new entry for save toggle:', newEntry);
        return [...prev, newEntry];
      }
    });
    
    await updateCourseProgress(courseId, { is_saved: newSavedState });
    toast.success(newSavedState ? 'Curso guardado' : 'Curso removido de guardados');
  };

  const startCourse = async (courseId: string) => {
    console.log('Starting course:', courseId);
    // When a user starts a course, update their progress to show it in "Continue Learning"
    await updateCourseProgress(courseId, { 
      progress_percentage: 1, // Small progress to show it started
      last_listened_at: new Date().toISOString()
    });
  };

  useEffect(() => {
    if (user) {
      console.log('User found, fetching progress for:', user.id);
      fetchUserProgress();
    } else {
      console.log('No user found, clearing progress');
      setUserProgress([]);
      setLoading(false);
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
