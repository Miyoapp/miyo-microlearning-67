
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isFetching, setIsFetching] = useState(false);
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchAttemptRef = useRef(0);
  const lastFetchTimeRef = useRef<number>(0);

  const fetchUserProgress = useCallback(async () => {
    const currentAttempt = ++fetchAttemptRef.current;
    const currentTime = Date.now();
    
    console.log(`🔍 [useUserProgress] Fetch attempt #${currentAttempt} - User:`, user?.id || 'none');
    console.log(`🔍 [useUserProgress] Current state - loading: ${loading}, isFetching: ${isFetching}`);
    console.log(`🔍 [useUserProgress] Time since last fetch: ${currentTime - lastFetchTimeRef.current}ms`);
    
    if (!user) {
      console.log('❌ [useUserProgress] No user found, setting loading to false');
      setLoading(false);
      return;
    }

    // Evitar llamadas duplicadas con timestamp mínimo
    if (isFetching) {
      console.log('🚫 [useUserProgress] Already fetching, skipping attempt #' + currentAttempt);
      return;
    }

    // Evitar llamadas muy frecuentes (menos de 1 segundo)
    if (currentTime - lastFetchTimeRef.current < 1000) {
      console.log('🚫 [useUserProgress] Too frequent call, skipping attempt #' + currentAttempt);
      return;
    }

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      console.log('🔄 [useUserProgress] Aborting previous request');
      abortControllerRef.current.abort();
    }

    setIsFetching(true);
    lastFetchTimeRef.current = currentTime;
    abortControllerRef.current = new AbortController();

    try {
      console.log('🔄 [useUserProgress] Starting fetch for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id);

      // Verificar si la petición fue cancelada
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🔄 [useUserProgress] Request was aborted');
        return;
      }

      if (error) {
        console.error('❌ [useUserProgress] Error fetching user progress:', error);
        throw error;
      }
      
      console.log('✅ [useUserProgress] Fetched user progress:', data?.length || 0, 'records');
      setUserProgress(data || []);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🔄 [useUserProgress] Fetch was cancelled');
        return;
      }
      console.error('❌ [useUserProgress] Error fetching user progress:', error);
      toast.error('Error al cargar el progreso');
    } finally {
      console.log('🏁 [useUserProgress] Fetch completed, setting states to false');
      setLoading(false);
      setIsFetching(false);
      abortControllerRef.current = null;
    }
  }, [user?.id, isFetching]); // Cambié dependencias para ser más específicas

  const updateCourseProgress = async (courseId: string, updates: Partial<UserCourseProgress>) => {
    if (!user) {
      console.log('❌ [useUserProgress] No user found, cannot update progress');
      return;
    }

    // Check if course is already 100% complete (review mode)
    const currentProgress = userProgress.find(p => p.course_id === courseId);
    if (currentProgress?.is_completed && currentProgress?.progress_percentage === 100) {
      console.log('🔒 [useUserProgress] Course already 100% complete, preserving progress in review mode:', courseId);
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

    console.log('🔄 [useUserProgress] Updating course progress for:', courseId, 'with updates:', updates);

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
        console.error('❌ [useUserProgress] Error updating course progress:', error);
        throw error;
      }
      
      console.log('✅ [useUserProgress] Successfully updated course progress in DB:', data);
      
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
          console.log('🔄 [useUserProgress] Updated local progress state:', newProgress);
          return newProgress;
        } else {
          const newProgress = [...prev, updatedProgress];
          console.log('🔄 [useUserProgress] Added new progress to local state:', newProgress);
          return newProgress;
        }
      });
    } catch (error) {
      console.error('❌ [useUserProgress] Error updating course progress:', error);
      toast.error('Error al actualizar el progreso');
    }
  };

  const toggleSaveCourse = async (courseId: string) => {
    const currentProgress = userProgress.find(p => p.course_id === courseId);
    const newSavedState = !currentProgress?.is_saved;
    
    console.log('🔄 [useUserProgress] Toggling save for course:', courseId, 'from', currentProgress?.is_saved, 'to', newSavedState);
    
    // Update local state immediately for better UX
    setUserProgress(prev => {
      const existing = prev.find(p => p.course_id === courseId);
      if (existing) {
        const updated = prev.map(p => 
          p.course_id === courseId 
            ? { ...p, is_saved: newSavedState }
            : p
        );
        console.log('🔄 [useUserProgress] Updated local state for save toggle:', updated);
        return updated;
      } else {
        const newEntry = {
          course_id: courseId,
          progress_percentage: 0,
          is_completed: false,
          is_saved: newSavedState,
          last_listened_at: new Date().toISOString()
        };
        console.log('🔄 [useUserProgress] Created new entry for save toggle:', newEntry);
        return [...prev, newEntry];
      }
    });
    
    await updateCourseProgress(courseId, { is_saved: newSavedState });
    toast.success(newSavedState ? 'Curso guardado' : 'Curso removido de guardados');
  };

  const startCourse = async (courseId: string) => {
    console.log('🔄 [useUserProgress] Starting course:', courseId);
    // When a user starts a course, update their progress to show it in "Continue Learning"
    await updateCourseProgress(courseId, { 
      progress_percentage: 1, // Small progress to show it started
      last_listened_at: new Date().toISOString()
    });
  };

  useEffect(() => {
    console.log('🔄 [useUserProgress] useEffect triggered with user:', user?.id || 'none');
    console.log('🔄 [useUserProgress] useEffect dependencies - user.id:', user?.id);
    
    fetchUserProgress();
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 [useUserProgress] Cleanup: aborting requests');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user?.id]); // Solo depender del user.id, no de fetchUserProgress

  return {
    userProgress,
    loading,
    isFetching,
    updateCourseProgress,
    toggleSaveCourse,
    startCourse,
    refetch: fetchUserProgress
  };
}
