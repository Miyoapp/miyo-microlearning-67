
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRealtimeSubscriptionManager } from './realtime/useRealtimeSubscriptionManager';

export interface CoursePurchase {
  id: string;
  course_id: string;
  fecha_compra: string;
  monto_pagado: number;
  estado_pago: 'pendiente' | 'completado' | 'cancelado';
}

export function useCoursePurchases() {
  const [purchases, setPurchases] = useState<CoursePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { createSubscription } = useRealtimeSubscriptionManager();
  
  // Stable references to prevent re-subscriptions
  const userIdRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const fetchPurchases = useCallback(async () => {
    if (!user) {
      console.log('🛒 No user found, skipping purchases fetch');
      setLoading(false);
      setError(null);
      setPurchases([]);
      return;
    }

    try {
      console.log('🛒 Fetching purchases for user:', user.id);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('compras_cursos')
        .select('*')
        .eq('user_id', user.id)
        .eq('estado_pago', 'completado');

      if (fetchError) {
        console.error('❌ Error fetching purchases:', fetchError);
        setError(fetchError.message);
        throw fetchError;
      }
      
      console.log('🛒 Raw purchases data from DB:', data);
      
      // Transform the data to match our interface with proper type casting
      const transformedData: CoursePurchase[] = (data || []).map(item => ({
        id: item.id,
        course_id: item.curso_id, // Note: DB column is curso_id, interface expects course_id
        fecha_compra: item.fecha_compra,
        monto_pagado: item.monto_pagado,
        estado_pago: item.estado_pago as 'pendiente' | 'completado' | 'cancelado'
      }));
      
      console.log('🛒 Transformed purchases:', transformedData);
      console.log('🛒 Course IDs user has purchased:', transformedData.map(p => p.course_id));
      
      setPurchases(transformedData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Error fetching purchases:', error);
      setError(errorMessage);
      setPurchases([]); // Set empty array on error for stable state
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Stable dependency

  const hasPurchased = useCallback((courseId: string) => {
    const purchased = purchases.some(p => p.course_id === courseId);
    console.log('🛒 Checking if user has purchased course:', courseId, '- Result:', purchased);
    console.log('🛒 Available purchases:', purchases.map(p => ({ id: p.course_id, estado: p.estado_pago })));
    return purchased;
  }, [purchases]);

  const createPurchase = async (courseId: string, amount: number) => {
    if (!user) return null;

    try {
      setError(null);
      const { data, error: createError } = await supabase
        .from('compras_cursos')
        .insert({
          user_id: user.id,
          curso_id: courseId,
          monto_pagado: amount,
          estado_pago: 'pendiente'
        })
        .select()
        .single();

      if (createError) {
        setError(createError.message);
        throw createError;
      }
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error creating purchase:', error);
      setError(errorMessage);
      return null;
    }
  };

  // Fetch purchases when user changes
  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  // Set up real-time subscription with protection against multiple subscriptions
  useEffect(() => {
    if (!user) {
      // Clean up any existing subscription when no user
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      userIdRef.current = null;
      return;
    }

    // Only create new subscription if user changed
    if (userIdRef.current === user.id && cleanupRef.current) {
      console.log('🔒 PURCHASES: User unchanged, keeping existing subscription');
      return;
    }

    // Clean up previous subscription
    if (cleanupRef.current) {
      console.log('🔌 PURCHASES: Cleaning up previous subscription');
      cleanupRef.current();
    }

    // Create new subscription with protection
    console.log('🔄 PURCHASES: Setting up real-time subscription for user:', user.id);
    userIdRef.current = user.id;
    
    const stableCallback = () => {
      console.log('🔄 PURCHASES: Real-time update detected, refetching...');
      fetchPurchases();
    };

    cleanupRef.current = createSubscription({
      channelName: `purchases-${user.id}`,
      table: 'compras_cursos',
      filter: `user_id=eq.${user.id}`,
      callback: stableCallback
    });

    return () => {
      if (cleanupRef.current) {
        console.log('🔌 PURCHASES: Component cleanup - removing subscription');
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [user?.id, createSubscription, fetchPurchases]);

  return {
    purchases,
    loading,
    error,
    hasPurchased,
    createPurchase,
    refetch: fetchPurchases
  };
}
