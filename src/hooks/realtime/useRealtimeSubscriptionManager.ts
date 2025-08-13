
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

  const createSubscription = useCallback((config: SubscriptionConfig): (() => void) => {
    const { channelName, table, filter, callback } = config;
    const subscriptionKey = `${channelName}-${table}-${filter || 'all'}`;

    // Check if already subscribed to prevent duplicates
    if (activeChannels.current.has(subscriptionKey)) {
      console.log('🔒 REALTIME: Subscription already exists for:', subscriptionKey);
      
      // Return cleanup function for existing subscription
      return () => {
        console.log('🔌 REALTIME: Cleaning up existing subscription:', subscriptionKey);
        const existingChannel = activeChannels.current.get(subscriptionKey);
        if (existingChannel) {
          supabase.removeChannel(existingChannel);
          activeChannels.current.delete(subscriptionKey);
        }
      };
    }

    console.log('🔄 REALTIME: Creating new subscription for:', subscriptionKey);

    // Create a unique channel name with timestamp to avoid conflicts
    const uniqueChannelName = `${channelName}-${Date.now()}`;
    const channel = supabase.channel(uniqueChannelName);
    
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

    // Store the channel with the subscription key (not the unique channel name)
    activeChannels.current.set(subscriptionKey, channel);

    // Return cleanup function
    return () => {
      console.log('🔌 REALTIME: Cleaning up subscription:', subscriptionKey);
      
      const activeChannel = activeChannels.current.get(subscriptionKey);
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
        activeChannels.current.delete(subscriptionKey);
      }
    };
  }, []);

  const cleanupAllSubscriptions = useCallback(() => {
    console.log('🔌 REALTIME: Cleaning up ALL subscriptions');
    
    activeChannels.current.forEach((channel, key) => {
      console.log('🔌 REALTIME: Removing channel:', key);
      supabase.removeChannel(channel);
    });
    
    activeChannels.current.clear();
  }, []);

  return {
    createSubscription,
    cleanupAllSubscriptions
  };
}
