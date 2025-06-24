
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface RealtimeManagerConfig {
  onLessonProgressUpdate?: () => void;
  onCourseProgressUpdate?: () => void;
  onPurchaseUpdate?: () => void;
  enabled?: boolean;
}

export function useRealtimeManager({
  onLessonProgressUpdate,
  onCourseProgressUpdate,
  onPurchaseUpdate,
  enabled = true
}: RealtimeManagerConfig = {}) {
  const { user } = useAuth();
  
  // Refs para controlar suscripciones activas
  const activeChannelsRef = useRef<Set<string>>(new Set());
  const subscriptionCountRef = useRef(0);
  const isSubscribedRef = useRef(false);

  const cleanup = useCallback(() => {
    console.log('🧹 [RealtimeManager] Cleaning up all subscriptions');
    
    // Remover todos los canales activos
    activeChannelsRef.current.forEach(channelName => {
      const channel = supabase.getChannels().find(ch => ch.topic === channelName);
      if (channel) {
        supabase.removeChannel(channel);
      }
    });
    
    activeChannelsRef.current.clear();
    isSubscribedRef.current = false;
    subscriptionCountRef.current = 0;
  }, []);

  const setupSubscriptions = useCallback(() => {
    if (!user || !enabled || isSubscribedRef.current) {
      console.log('🚫 [RealtimeManager] Skipping setup - conditions not met:', {
        hasUser: !!user,
        enabled,
        alreadySubscribed: isSubscribedRef.current
      });
      return;
    }

    // Prevenir múltiples intentos de suscripción
    if (subscriptionCountRef.current > 0) {
      console.log('🚫 [RealtimeManager] Subscription already in progress');
      return;
    }

    subscriptionCountRef.current++;
    console.log('🔄 [RealtimeManager] Setting up subscriptions for user:', user.id);

    // Limpiar cualquier suscripción existente primero
    cleanup();

    const timestamp = Date.now();
    
    // Lesson progress subscription
    if (onLessonProgressUpdate) {
      const lessonChannelName = `lesson-progress-${user.id}-${timestamp}`;
      
      const lessonChannel = supabase
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
            console.log('📈 [RealtimeManager] Lesson progress update:', payload);
            onLessonProgressUpdate();
          }
        )
        .subscribe((status) => {
          console.log('📈 [RealtimeManager] Lesson channel status:', status);
        });

      activeChannelsRef.current.add(lessonChannelName);
    }

    // Course progress subscription
    if (onCourseProgressUpdate) {
      const courseChannelName = `course-progress-${user.id}-${timestamp}`;
      
      const courseChannel = supabase
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
            console.log('📊 [RealtimeManager] Course progress update:', payload);
            onCourseProgressUpdate();
          }
        )
        .subscribe((status) => {
          console.log('📊 [RealtimeManager] Course channel status:', status);
        });

      activeChannelsRef.current.add(courseChannelName);
    }

    // Purchase subscription
    if (onPurchaseUpdate) {
      const purchaseChannelName = `purchases-${user.id}-${timestamp}`;
      
      const purchaseChannel = supabase
        .channel(purchaseChannelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'compras_cursos',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🛒 [RealtimeManager] Purchase update:', payload);
            onPurchaseUpdate();
          }
        )
        .subscribe((status) => {
          console.log('🛒 [RealtimeManager] Purchase channel status:', status);
        });

      activeChannelsRef.current.add(purchaseChannelName);
    }

    isSubscribedRef.current = true;
    console.log('✅ [RealtimeManager] All subscriptions set up');

  }, [user?.id, enabled, onLessonProgressUpdate, onCourseProgressUpdate, onPurchaseUpdate, cleanup]);

  // Setup subscriptions when dependencies change
  useEffect(() => {
    setupSubscriptions();
    
    return () => {
      cleanup();
    };
  }, [setupSubscriptions, cleanup]);

  // Reset subscription state when user changes
  useEffect(() => {
    isSubscribedRef.current = false;
    subscriptionCountRef.current = 0;
  }, [user?.id]);

  return {
    cleanup,
    isSubscribed: isSubscribedRef.current,
    activeChannelCount: activeChannelsRef.current.size
  };
}
