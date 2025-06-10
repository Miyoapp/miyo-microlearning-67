
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  is_completed: boolean;
  current_position: number;
  created_at: string;
  updated_at: string;
}

export function useUserLessonProgress() {
  const [lessonProgress, setLessonProgress] = useState<UserLessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLessonProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching lesson progress:', error);
        throw error;
      }
      
      console.log('Fetched lesson progress from DB:', data);
      setLessonProgress(data || []);
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      toast.error('Error al cargar el progreso de lecciones');
    } finally {
      setLoading(false);
    }
  };

  const updateLessonProgress = async (
    lessonId: string, 
    courseId: string, 
    updates: Partial<Pick<UserLessonProgress, 'is_completed' | 'current_position'>>
  ) => {
    if (!user) {
      console.log('No user found, cannot update lesson progress');
      return;
    }

    console.log('Updating lesson progress for:', lessonId, 'with updates:', updates);

    try {
      // First, get the existing progress to preserve important fields
      const { data: existingData, error: fetchError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching existing progress:', fetchError);
        throw fetchError;
      }

      // Prepare the data for upsert
      const baseData = {
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // If record exists, use existing values as base
      const existingProgress = existingData || {
        is_completed: false,
        current_position: 0
      };

      // Apply the updates
      const finalData = {
        ...baseData,
        is_completed: existingProgress.is_completed,
        current_position: existingProgress.current_position,
        ...updates
      };

      // DEFENSIVE VALIDATION: If position >= 100, it should be completed
      if (finalData.current_position >= 100) {
        finalData.is_completed = true;
        console.log('🛡️ Defensive validation: Setting is_completed=true because current_position >= 100');
      }

      console.log('Final data for upsert:', finalData);

      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert(finalData, {
          onConflict: 'user_id,lesson_id'
        })
        .select();

      if (error) {
        console.error('Error updating lesson progress:', error);
        throw error;
      }
      
      console.log('Successfully updated lesson progress in DB:', data);
      
      // Update local state
      setLessonProgress(prev => {
        const updatedProgress = {
          id: data[0]?.id || '',
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...existingProgress,
          ...updates
        };

        // Apply same defensive validation to local state
        if (updatedProgress.current_position >= 100) {
          updatedProgress.is_completed = true;
        }
        
        const existing = prev.find(p => p.lesson_id === lessonId);
        if (existing) {
          return prev.map(p => 
            p.lesson_id === lessonId 
              ? updatedProgress
              : p
          );
        } else {
          return [...prev, updatedProgress];
        }
      });
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      toast.error('Error al actualizar el progreso de la lección');
    }
  };

  const markLessonComplete = async (lessonId: string, courseId: string) => {
    // Check if lesson is already completed to avoid unnecessary updates
    const existingProgress = lessonProgress.find(p => p.lesson_id === lessonId);
    if (existingProgress?.is_completed) {
      console.log('Lesson already completed in DB, skipping update:', lessonId);
      return;
    }

    console.log('Marking lesson complete:', lessonId, 'for course:', courseId);
    await updateLessonProgress(lessonId, courseId, { 
      is_completed: true,
      current_position: 100 // 100% complete
    });
  };

  // Improved function to update lesson position with better state preservation
  const updateLessonPosition = useCallback(
    async (lessonId: string, courseId: string, position: number) => {
      // Get current state from local state first (for performance)
      const existingProgress = lessonProgress.find(p => p.lesson_id === lessonId);
      
      // CRITICAL: Don't update position for already completed lessons unless explicitly needed
      if (existingProgress?.is_completed && position < 100) {
        console.log('🔒 Lesson already completed, not updating position to lower value:', lessonId, 'current position:', position);
        return;
      }

      console.log('📍 Updating lesson position:', lessonId, 'position:', position, 'existing completion status:', existingProgress?.is_completed);
      
      // Prepare updates - preserve completion status unless position reaches 100%
      const updates: Partial<Pick<UserLessonProgress, 'is_completed' | 'current_position'>> = {
        current_position: Math.round(position)
      };

      // Only update completion status if position reaches 100% (defensive)
      if (position >= 100) {
        updates.is_completed = true;
        console.log('🎯 Position reached 100%, marking as completed');
      }

      await updateLessonProgress(lessonId, courseId, updates);
    },
    [lessonProgress]
  );

  useEffect(() => {
    if (user) {
      console.log('User found, fetching lesson progress for:', user.id);
      fetchLessonProgress();
    } else {
      console.log('No user found, clearing lesson progress');
      setLessonProgress([]);
      setLoading(false);
    }
  }, [user]);

  return {
    lessonProgress,
    loading,
    updateLessonProgress,
    markLessonComplete,
    updateLessonPosition,
    refetch: fetchLessonProgress
  };
}
