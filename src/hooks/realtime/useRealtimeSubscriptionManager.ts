
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

    // Clean up any existing subscription for this key
    const existingChannel = activeChannels.current.get(subscriptionKey);
    if (existingChannel) {
      console.log('🔌 REALTIME: Cleaning up existing subscription for:', subscriptionKey);
      supabase.removeChannel(existingChannel);
      activeChannels.current.delete(subscriptionKey);
    }

    console.log('🔄 REALTIME: Creating new subscription for:', subscriptionKey);

    // Create a truly unique channel name to avoid any conflicts
    const uniqueChannelName = `${subscriptionKey}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const channel = supabase.channel(uniqueChannelName);
    
    // Set up the subscription
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

    // Subscribe to the channel
    subscription.subscribe((status) => {
      console.log(`📡 REALTIME STATUS [${subscriptionKey}]:`, status);
      
      // FIXED: Use string comparison instead of enum
      if (status === 'SUBSCRIPTION_ERROR') {
        console.error('🚨 REALTIME ERROR for:', subscriptionKey);
        // Clean up on error
        activeChannels.current.delete(subscriptionKey);
      }
    });

    // Store the channel
    activeChannels.current.set(subscriptionKey, channel);

    // Return cleanup function
    return () => {
      console.log('🔌 REALTIME: Cleaning up subscription:', subscriptionKey);
      
      // Remove channel
      const activeChannel = activeChannels.current.get(subscriptionKey);
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
        activeChannels.current.delete(subscriptionKey);
      }
    };
  }, []);

  const cleanupAllSubscriptions = useCallback(() => {
    console.log('🔌 REALTIME: Cleaning up ALL subscriptions');
    
    // Remove all channels
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
