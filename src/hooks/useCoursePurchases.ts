
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

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
  const { user } = useAuth();
  
  // Ref to track active channel and prevent duplicate subscriptions
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchPurchases = async () => {
    if (!user) {
      console.log('🛒 No user found, skipping purchases fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('🛒 Fetching purchases for user:', user.id);
      
      const { data, error } = await supabase
        .from('compras_cursos')
        .select('*')
        .eq('user_id', user.id)
        .eq('estado_pago', 'completado');

      if (error) {
        console.error('❌ Error fetching purchases:', error);
        throw error;
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
      console.error('❌ Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPurchased = (courseId: string) => {
    const purchased = purchases.some(p => p.course_id === courseId);
    console.log('🛒 Checking if user has purchased course:', courseId, '- Result:', purchased);
    console.log('🛒 Available purchases:', purchases.map(p => ({ id: p.course_id, estado: p.estado_pago })));
    return purchased;
  };

  const createPurchase = async (courseId: string, amount: number) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('compras_cursos')
        .insert({
          user_id: user.id,
          curso_id: courseId,
          monto_pagado: amount,
          estado_pago: 'pendiente'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating purchase:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [user]);

  // Set up real-time subscription to purchases - WITH PROPER CLEANUP
  useEffect(() => {
    if (!user || isSubscribedRef.current) {
      console.log('🛒 Skipping realtime setup - no user or already subscribed');
      return;
    }

    console.log('🔄 Setting up real-time subscription for purchases');
    
    // Clean up any existing channel first
    if (channelRef.current) {
      console.log('🧹 Cleaning up existing purchases channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create unique channel name to avoid conflicts
    const channelName = `purchases-${user.id}-${Date.now()}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'compras_cursos',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time purchase update:', payload);
          fetchPurchases(); // Refetch purchases when there's a change
        }
      )
      .subscribe((status) => {
        console.log('🛒 Purchases channel status:', status);
      });

    isSubscribedRef.current = true;

    return () => {
      console.log('🔌 Cleaning up purchases subscription');
      isSubscribedRef.current = false;
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]);

  // Reset subscription state when user changes
  useEffect(() => {
    isSubscribedRef.current = false;
  }, [user?.id]);

  return {
    purchases,
    loading,
    hasPurchased,
    createPurchase,
    refetch: fetchPurchases
  };
}
