
import { useEffect, useCallback } from 'react';
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

  const setupRealtimeSubscriptions = useCallback(() => {
    if (!user) return;

    console.log('🔄 Setting up realtime subscriptions for user:', user.id);

    // Subscribe to lesson progress changes
    const lessonProgressChannel = supabase
      .channel('lesson-progress-changes')
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
          onLessonProgressUpdate?.();
        }
      )
      .subscribe();

    // Subscribe to course progress changes
    const courseProgressChannel = supabase
      .channel('course-progress-changes')
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
          onCourseProgressUpdate?.();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up realtime subscriptions');
      supabase.removeChannel(lessonProgressChannel);
      supabase.removeChannel(courseProgressChannel);
    };
  }, [user?.id, onLessonProgressUpdate, onCourseProgressUpdate]);

  useEffect(() => {
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, [setupRealtimeSubscriptions]);

  return {
    setupRealtimeSubscriptions
  };
}
