
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
  const isInitializedRef = useRef<boolean>(false);

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
      
      // Clean up any existing subscriptions when no user
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
      userIdRef.current = null;
      isInitializedRef.current = false;
      return;
    }

    // Prevent duplicate subscriptions for the same user
    if (userIdRef.current === user.id && isInitializedRef.current) {
      console.log('🔒 REALTIME PROGRESS: User unchanged and already initialized, keeping existing subscriptions');
      return;
    }

    // Clean up previous subscriptions before creating new ones
    if (cleanupFunctionsRef.current.length > 0) {
      console.log('🔌 REALTIME PROGRESS: Cleaning up previous subscriptions before creating new ones');
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    }

    console.log('🔄 REALTIME PROGRESS: Setting up subscriptions for user:', user.id);
    userIdRef.current = user.id;
    isInitializedRef.current = true;

    // Create lesson progress subscription with unique channel names
    const lessonCleanup = createSubscription({
      channelName: `lesson-progress-${user.id}-${Date.now()}`,
      table: 'user_lesson_progress',
      filter: `user_id=eq.${user.id}`,
      callback: stableLessonCallback
    });

    // Create course progress subscription with unique channel names
    const courseCleanup = createSubscription({
      channelName: `course-progress-${user.id}-${Date.now()}`,
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
      isInitializedRef.current = false;
    };
  }, [setupRealtimeSubscriptions]);

  return {
    setupRealtimeSubscriptions
  };
}
