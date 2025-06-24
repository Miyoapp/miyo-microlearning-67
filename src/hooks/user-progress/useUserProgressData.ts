
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { UserCourseProgress } from './types';

export function useUserProgressData() {
  const [userProgress, setUserProgress] = useState<UserCourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserProgress = useCallback(async () => {
    console.log('📊 FETCH USER PROGRESS START:', { 
      hasUser: !!user,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
    
    if (!user) {
      console.log('📊 No user found, setting empty progress array (stable state)');
      setUserProgress([]); // GUARANTEED: Always set empty array for no user
      setLoading(false);
      return;
    }

    try {
      console.log('📊 Fetching user progress for user:', user.id);
      setLoading(true); // Ensure loading state is set
      
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error fetching user progress:', error);
        throw error;
      }
      
      // GUARANTEED: Always set the progress array, even if empty
      const progressData = data || [];
      console.log('📊 Fetched user progress from DB (STABLE):', {
        totalRecords: progressData.length,
        courses: progressData.map(p => ({ courseId: p.course_id, progress: p.progress_percentage })),
        isEmpty: progressData.length === 0,
        isValidEmptyState: true,
        isStableData: true
      });
      setUserProgress(progressData);
    } catch (error) {
      console.error('❌ Error fetching user progress:', error);
      toast.error('Error al cargar el progreso');
      // GUARANTEED: Set empty array on error to ensure stable state
      console.log('📊 Setting empty array due to error (stable fallback)');
      setUserProgress([]);
    } finally {
      console.log('📊 Setting loading to false (stable completion)');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserProgress();
  }, [fetchUserProgress]);

  console.log('📊 USER PROGRESS DATA STATE:', {
    userProgressLength: userProgress.length,
    loading,
    hasUser: !!user,
    isStableState: !loading || userProgress.length > 0
  });

  return {
    userProgress,
    setUserProgress,
    loading,
    refetch: fetchUserProgress
  };
}
