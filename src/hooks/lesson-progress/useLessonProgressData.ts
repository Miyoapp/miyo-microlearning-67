
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { UserLessonProgress } from './types';
import { useRealtimeSubscriptionManager } from '../realtime/useRealtimeSubscriptionManager';

export function useLessonProgressData() {
  const [lessonProgress, setLessonProgress] = useState<UserLessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { createSubscription } = useRealtimeSubscriptionManager();
  
  // Stable references to prevent re-subscriptions
  const userIdRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  const fetchLessonProgress = useCallback(async () => {
    if (!user) {
      console.log('👤 No user found for lesson progress, setting empty state');
      setLessonProgress([]);
      setLoading(false);
      return;
    }

    try {
      console.log('📚 Fetching lesson progress for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching lesson progress:', error);
        throw error;
      }
      
      console.log('📚 Fetched lesson progress from DB:', data);
      setLessonProgress(data || []);
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      toast.error('Error al cargar el progreso de lecciones');
      setLessonProgress([]); // Set empty array on error for stable state
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch data when user changes
  useEffect(() => {
    fetchLessonProgress();
  }, [fetchLessonProgress]);

  // Set up real-time subscription with protection against multiple subscriptions
  useEffect(() => {
    if (!user) {
      // Clean up any existing subscription when no user
      if (cleanupRef.current) {
        console.log('🔌 LESSON PROGRESS: Cleaning up subscription - no user');
        cleanupRef.current();
        cleanupRef.current = null;
      }
      userIdRef.current = null;
      isInitializedRef.current = false;
      return;
    }

    // Only create new subscription if user changed or not yet initialized
    if (userIdRef.current === user.id && isInitializedRef.current && cleanupRef.current) {
      console.log('🔒 LESSON PROGRESS: User unchanged and subscription active, keeping existing subscription');
      return;
    }

    // Clean up previous subscription
    if (cleanupRef.current) {
      console.log('🔌 LESSON PROGRESS: Cleaning up previous subscription');
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Create new subscription with protection
    console.log('🔄 LESSON PROGRESS: Setting up real-time subscription for user:', user.id);
    userIdRef.current = user.id;
    isInitializedRef.current = true;
    
    const stableCallback = () => {
      console.log('🔄 LESSON PROGRESS: Real-time update detected, refetching...');
      fetchLessonProgress();
    };

    cleanupRef.current = createSubscription({
      channelName: `lesson-progress-data-${user.id}-${Date.now()}`,
      table: 'user_lesson_progress',
      filter: `user_id=eq.${user.id}`,
      callback: stableCallback
    });

    return () => {
      if (cleanupRef.current) {
        console.log('🔌 LESSON PROGRESS: Component cleanup - removing subscription');
        cleanupRef.current();
        cleanupRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [user?.id, createSubscription, fetchLessonProgress]);

  return {
    lessonProgress,
    setLessonProgress,
    loading,
    refetch: fetchLessonProgress
  };
}
