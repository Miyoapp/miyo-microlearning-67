
import { useEffect, useCallback, useState, useRef } from 'react';
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
  const channelsRef = useRef<any[]>([]);
  const setupRef = useRef(false);

  const setupRealtimeSubscriptions = useCallback(() => {
    if (!user || setupRef.current) {
      console.log('🔒 Skipping realtime setup - user:', !!user, 'already setup:', setupRef.current);
      return;
    }

    console.log('🔄 Setting up realtime subscriptions for user:', user.id);
    setupRef.current = true;

    // Clear any existing channels first
    if (channelsRef.current.length > 0) {
      console.log('🧹 Cleaning existing channels before setup');
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    }

    // Subscribe to lesson progress changes
    const lessonProgressChannel = supabase
      .channel(`lesson-progress-${user.id}`)
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
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to lesson progress channel');
          setSubscribed(false);
        }
      });

    // Subscribe to course progress changes
    const courseProgressChannel = supabase
      .channel(`course-progress-${user.id}`)
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
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to course progress channel');
          setSubscribed(false);
        }
      });

    // Store channels for cleanup
    channelsRef.current = [lessonProgressChannel, courseProgressChannel];

    // Return cleanup function
    return () => {
      console.log('🔌 Cleaning up realtime subscriptions');
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      setupRef.current = false;
      setSubscribed(false);
    };
  }, [user?.id, onLessonProgressUpdate, onCourseProgressUpdate]);

  // Set up realtime progress monitor
  useEffect(() => {
    if (!user) {
      console.log('🚫 No user, skipping realtime setup');
      return;
    }

    const cleanup = setupRealtimeSubscriptions();
    
    return () => {
      cleanup?.();
    };
  }, [setupRealtimeSubscriptions, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, cleaning up all realtime subscriptions');
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      setupRef.current = false;
    };
  }, []);

  return {
    setupRealtimeSubscriptions,
    isConnected: subscribed
  };
}
