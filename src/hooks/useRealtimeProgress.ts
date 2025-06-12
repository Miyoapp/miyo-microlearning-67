
import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

interface UseRealtimeProgressProps {
  onLessonProgressUpdate?: () => void;
  onCourseProgressUpdate?: () => void;
}

export function useRealtimeProgress({ 
  onLessonProgressUpdate, 
  onCourseProgressUpdate 
}: UseRealtimeProgressProps = {}) {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);

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
          // Notify user with a subtle toast
          toast.success('Progreso de lección actualizado', {
            duration: 2000,
            position: 'bottom-right',
          });
          onLessonProgressUpdate?.();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to lesson progress changes');
          setSubscribed(true);
        }
      });

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
          // Notify user with a subtle toast
          toast.success('Progreso del curso actualizado', {
            duration: 2000, 
            position: 'bottom-right',
          });
          onCourseProgressUpdate?.();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to course progress changes');
          setSubscribed(true);
        }
      });

    // Return cleanup function
    return () => {
      console.log('🔌 Cleaning up realtime subscriptions');
      supabase.removeChannel(lessonProgressChannel);
      supabase.removeChannel(courseProgressChannel);
    };
  }, [user?.id, onLessonProgressUpdate, onCourseProgressUpdate]);

  // Set up realtime progress monitor
  useEffect(() => {
    const cleanup = setupRealtimeSubscriptions();
    
    // Reconnect subscriptions if they fail
    const reconnectInterval = setInterval(() => {
      if (user && !subscribed) {
        console.log('🔄 Attempting to reconnect realtime subscriptions');
        setupRealtimeSubscriptions();
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      cleanup?.();
      clearInterval(reconnectInterval);
    };
  }, [setupRealtimeSubscriptions, user, subscribed]);

  return {
    setupRealtimeSubscriptions,
    isConnected: subscribed
  };
}
