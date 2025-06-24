
import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionConfig {
  channelName: string;
  table: string;
  filter?: string;
  callback: (payload: any) => void;
}

export function useRealtimeSubscriptionManager() {
  const activeChannels = useRef<Map<string, RealtimeChannel>>(new Map());
  const subscriptionStates = useRef<Map<string, boolean>>(new Map());

  const createSubscription = useCallback((config: SubscriptionConfig): (() => void) => {
    const { channelName, table, filter, callback } = config;
    const subscriptionKey = `${channelName}-${table}-${filter || 'all'}`;

    // Check if already subscribed to prevent duplicates
    if (subscriptionStates.current.get(subscriptionKey)) {
      console.log('🔒 REALTIME: Subscription already exists for:', subscriptionKey);
      return () => {}; // Return empty cleanup function
    }

    console.log('🔄 REALTIME: Creating new subscription for:', subscriptionKey);
    subscriptionStates.current.set(subscriptionKey, true);

    const channel = supabase.channel(channelName);
    
    const subscription = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        ...(filter && { filter })
      },
      (payload) => {
        console.log(`📡 REALTIME UPDATE [${subscriptionKey}]:`, payload);
        callback(payload);
      }
    );

    subscription.subscribe((status) => {
      console.log(`📡 REALTIME STATUS [${subscriptionKey}]:`, status);
    });

    activeChannels.current.set(subscriptionKey, channel);

    // Return cleanup function
    return () => {
      console.log('🔌 REALTIME: Cleaning up subscription:', subscriptionKey);
      
      const activeChannel = activeChannels.current.get(subscriptionKey);
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
        activeChannels.current.delete(subscriptionKey);
      }
      
      subscriptionStates.current.set(subscriptionKey, false);
    };
  }, []);

  const cleanupAllSubscriptions = useCallback(() => {
    console.log('🔌 REALTIME: Cleaning up ALL subscriptions');
    
    activeChannels.current.forEach((channel, key) => {
      supabase.removeChannel(channel);
      subscriptionStates.current.set(key, false);
    });
    
    activeChannels.current.clear();
  }, []);

  return {
    createSubscription,
    cleanupAllSubscriptions
  };
}
