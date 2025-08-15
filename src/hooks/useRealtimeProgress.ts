
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
  
  // Stable references to prevent re-subscriptions
  const userIdRef = useRef<string | null>(null);
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

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

    // Only create new subscriptions if user changed
    if (userIdRef.current === user.id && cleanupFunctionsRef.current.length > 0) {
      console.log('🔒 REALTIME PROGRESS: User unchanged, keeping existing subscriptions');
      return;
    }

    // Clean up previous subscriptions
    cleanupFunctionsRef.current.forEach(cleanup => cleanup());
    cleanupFunctionsRef.current = [];

    console.log('🔄 REALTIME PROGRESS: Setting up subscriptions for user:', user.id);
    userIdRef.current = user.id;

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
    };
  }, [setupRealtimeSubscriptions]);

  return {
    setupRealtimeSubscriptions
  };
}
