
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
  const subscriptionCallbacks = useRef<Map<string, (payload: any) => void>>(new Map());

  const createSubscription = useCallback((config: SubscriptionConfig): (() => void) => {
    const { channelName, table, filter, callback } = config;
    const subscriptionKey = `${channelName}-${table}-${filter || 'all'}`;

    // If subscription already exists, just update the callback
    if (activeChannels.current.has(subscriptionKey)) {
      console.log('🔄 REALTIME: Updating existing subscription callback for:', subscriptionKey);
      subscriptionCallbacks.current.set(subscriptionKey, callback);
      
      return () => {
        console.log('🔌 REALTIME: Cleaning up callback for:', subscriptionKey);
        subscriptionCallbacks.current.delete(subscriptionKey);
        
        // Only remove channel if no more callbacks exist
        if (!subscriptionCallbacks.current.has(subscriptionKey)) {
          const channel = activeChannels.current.get(subscriptionKey);
          if (channel) {
            console.log('🔌 REALTIME: Removing channel:', subscriptionKey);
            supabase.removeChannel(channel);
            activeChannels.current.delete(subscriptionKey);
          }
        }
      };
    }

    console.log('🔄 REALTIME: Creating new subscription for:', subscriptionKey);

    // Create a truly unique channel name to avoid any conflicts
    const uniqueChannelName = `${subscriptionKey}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const channel = supabase.channel(uniqueChannelName);
    
    // Store callback for this subscription
    subscriptionCallbacks.current.set(subscriptionKey, callback);
    
    // Set up the subscription with a wrapper callback
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
        
        // Call the current callback for this subscription
        const currentCallback = subscriptionCallbacks.current.get(subscriptionKey);
        if (currentCallback) {
          currentCallback(payload);
        }
      }
    );

    // Subscribe to the channel
    subscription.subscribe((status) => {
      console.log(`📡 REALTIME STATUS [${subscriptionKey}]:`, status);
      
      if (status === 'SUBSCRIPTION_ERROR') {
        console.error('🚨 REALTIME ERROR for:', subscriptionKey);
        // Clean up on error
        activeChannels.current.delete(subscriptionKey);
        subscriptionCallbacks.current.delete(subscriptionKey);
      }
    });

    // Store the channel
    activeChannels.current.set(subscriptionKey, channel);

    // Return cleanup function
    return () => {
      console.log('🔌 REALTIME: Cleaning up subscription:', subscriptionKey);
      
      // Remove callback
      subscriptionCallbacks.current.delete(subscriptionKey);
      
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
    
    // Clear all callbacks
    subscriptionCallbacks.current.clear();
    
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
