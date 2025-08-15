
import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRealtimeSubscriptionManager } from './realtime/useRealtimeSubscriptionManager';

interface UseRealtimeProgressProps {
  onLessonProgressUpdate?: () => void;
  onCourseProgressUpdate?: () => void;
}

export function useRealtimeProgress({ 
  onLessonProgressUpdate, 
  onCourseProgressUpdate 
}: UseRealtimeProgressProps = {}) {
  const { user } = useAuth();
  const { createSubscription } = useRealtimeSubscriptionManager();
  
  // Track current user and cleanup functions
  const userIdRef = useRef<string | null>(null);
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);
  const isSubscribedRef = useRef<boolean>(false);

  // Stable callbacks to prevent subscription recreation
  const stableLessonCallback = useCallback(() => {
    console.log('📈 Lesson progress updated via realtime');
    onLessonProgressUpdate?.();
  }, [onLessonProgressUpdate]);

  const stableCourseCallback = useCallback(() => {
    console.log('📊 Course progress updated via realtime');
    onCourseProgressUpdate?.();
  }, [onCourseProgressUpdate]);

  const setupRealtimeSubscriptions = useCallback(() => {
    if (!user) {
      console.log('👤 No user found, skipping realtime subscriptions');
      return;
    }

    // Prevent duplicate subscriptions for the same user
    if (userIdRef.current === user.id && isSubscribedRef.current) {
      console.log('🔒 REALTIME PROGRESS: Already subscribed for user:', user.id);
      return;
    }

    // Clean up previous subscriptions
    if (cleanupFunctionsRef.current.length > 0) {
      console.log('🔌 REALTIME PROGRESS: Cleaning up previous subscriptions');
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    }

    console.log('🔄 REALTIME PROGRESS: Setting up subscriptions for user:', user.id);
    userIdRef.current = user.id;
    isSubscribedRef.current = true;

    // Create lesson progress subscription
    const lessonCleanup = createSubscription({
      channelName: `lesson-progress-${user.id}`,
      table: 'user_lesson_progress',
      filter: `user_id=eq.${user.id}`,
      callback: stableLessonCallback
    });

    // Create course progress subscription
    const courseCleanup = createSubscription({
      channelName: `course-progress-${user.id}`,
      table: 'user_course_progress',
      filter: `user_id=eq.${user.id}`,
      callback: stableCourseCallback
    });

    cleanupFunctionsRef.current = [lessonCleanup, courseCleanup];
  }, [user?.id, createSubscription, stableLessonCallback, stableCourseCallback]);

  useEffect(() => {
    setupRealtimeSubscriptions();

    return () => {
      console.log('🔌 REALTIME PROGRESS: Component cleanup - removing all subscriptions');
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
      isSubscribedRef.current = false;
      userIdRef.current = null;
    };
  }, [setupRealtimeSubscriptions]);

  return {
    setupRealtimeSubscriptions
  };
}
