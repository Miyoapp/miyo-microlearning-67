import { useState, useEffect, useCallback } from 'react';
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

  const fetchUserProgress = useCallback(async () => {
    if (!user) {
      console.log('📊 No user found, setting empty progress array');
      setUserProgress([]); // CRITICAL FIX: Set empty array instead of keeping loading
      setLoading(false);
      return;
    }

    try {
      console.log('📊 Fetching user progress for user:', user.id);
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error fetching user progress:', error);
        throw error;
      }
      
      // CRITICAL FIX: Always set the progress array, even if empty
      const progressData = data || [];
      console.log('📊 Fetched user progress from DB:', {
        totalRecords: progressData.length,
        courses: progressData.map(p => ({ courseId: p.course_id, progress: p.progress_percentage }))
      });
      setUserProgress(progressData);
    } catch (error) {
      console.error('❌ Error fetching user progress:', error);
      toast.error('Error al cargar el progreso');
      // CRITICAL FIX: Set empty array on error to prevent blank screen
      setUserProgress([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateCourseProgress = async (courseId: string, updates: Partial<UserCourseProgress>) => {
    if (!user) {
      console.log('No user found, cannot update progress');
      return;
    }

    // Check if course is already 100% complete (review mode)
    const currentProgress = userProgress.find(p => p.course_id === courseId);
    if (currentProgress?.is_completed && currentProgress?.progress_percentage === 100) {
      console.log('🔒 Course already 100% complete, preserving progress in review mode:', courseId);
      // Only allow saving/unsaving in review mode
      if (updates.is_saved !== undefined) {
        const preservedUpdates = {
          is_saved: updates.is_saved,
          last_listened_at: new Date().toISOString()
        };
        updates = preservedUpdates;
      } else {
        return; // Skip other updates in review mode
      }
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
    
    console.log('💾 Toggling save for course:', courseId, 'from', currentProgress?.is_saved, 'to', newSavedState);
    
    // Update local state immediately for better UX
    setUserProgress(prev => {
      const existing = prev.find(p => p.course_id === courseId);
      if (existing) {
        const updated = prev.map(p => 
          p.course_id === courseId 
            ? { ...p, is_saved: newSavedState }
            : p
        );
        console.log('💾 Updated local state for save toggle:', updated);
        return updated;
      } else {
        const newEntry = {
          course_id: courseId,
          progress_percentage: 0,
          is_completed: false,
          is_saved: newSavedState,
          last_listened_at: new Date().toISOString()
        };
        console.log('💾 Created new entry for save toggle:', newEntry);
        return [...prev, newEntry];
      }
    });
    
    await updateCourseProgress(courseId, { is_saved: newSavedState });
    toast.success(newSavedState ? 'Curso guardado' : 'Curso removido de guardados');
  };

  const startCourse = async (courseId: string) => {
    console.log('🚀 Starting course:', courseId);
    // When a user starts a course, update their progress to show it in "Continue Learning"
    await updateCourseProgress(courseId, { 
      progress_percentage: 1, // Small progress to show it started
      last_listened_at: new Date().toISOString()
    });
  };

  useEffect(() => {
    fetchUserProgress();
  }, [fetchUserProgress]);

  return {
    userProgress,
    loading,
    updateCourseProgress,
    toggleSaveCourse,
    startCourse,
    refetch: fetchUserProgress
  };
}
