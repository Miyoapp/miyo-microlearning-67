
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface UseRealtimeProgressProps {
  onLessonProgressUpdate?: () => void;
  onCourseProgressUpdate?: () => void;
}

export function useRealtimeProgress({ 
  onLessonProgressUpdate, 
  onCourseProgressUpdate 
}: UseRealtimeProgressProps = {}) {
  const { user } = useAuth();
  
  // Refs to track active channels and prevent duplicate subscriptions
  const lessonChannelRef = useRef<any>(null);
  const courseChannelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const setupRealtimeSubscriptions = useCallback(() => {
    if (!user || isSubscribedRef.current) {
      console.log('🔄 Skipping realtime setup - no user or already subscribed');
      return;
    }

    console.log('🔄 Setting up realtime subscriptions for user:', user.id);

    // Clean up any existing channels first
    if (lessonChannelRef.current) {
      console.log('🧹 Cleaning up existing lesson channel');
      supabase.removeChannel(lessonChannelRef.current);
      lessonChannelRef.current = null;
    }

    if (courseChannelRef.current) {
      console.log('🧹 Cleaning up existing course channel');
      supabase.removeChannel(courseChannelRef.current);
      courseChannelRef.current = null;
    }

    // Create unique channel names to avoid conflicts
    const lessonChannelName = `lesson-progress-${user.id}-${Date.now()}`;
    const courseChannelName = `course-progress-${user.id}-${Date.now()}`;

    // Subscribe to lesson progress changes
    if (onLessonProgressUpdate) {
      lessonChannelRef.current = supabase
        .channel(lessonChannelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_lesson_progress',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('📈 Lesson progress updated via realtime:', payload);
            onLessonProgressUpdate();
          }
        )
        .subscribe((status) => {
          console.log('📈 Lesson progress channel status:', status);
        });
    }

    // Subscribe to course progress changes
    if (onCourseProgressUpdate) {
      courseChannelRef.current = supabase
        .channel(courseChannelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_course_progress',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('📊 Course progress updated via realtime:', payload);
            onCourseProgressUpdate();
          }
        )
        .subscribe((status) => {
          console.log('📊 Course progress channel status:', status);
        });
    }

    isSubscribedRef.current = true;

    return () => {
      console.log('🔌 Cleaning up realtime subscriptions');
      isSubscribedRef.current = false;
      
      if (lessonChannelRef.current) {
        supabase.removeChannel(lessonChannelRef.current);
        lessonChannelRef.current = null;
      }
      
      if (courseChannelRef.current) {
        supabase.removeChannel(courseChannelRef.current);
        courseChannelRef.current = null;
      }
    };
  }, [user?.id, onLessonProgressUpdate, onCourseProgressUpdate]);

  useEffect(() => {
    const cleanup = setupRealtimeSubscriptions();
    
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [setupRealtimeSubscriptions]);

  // Reset subscription state when user changes
  useEffect(() => {
    isSubscribedRef.current = false;
  }, [user?.id]);

  return {
    setupRealtimeSubscriptions
  };
}
