
import { useState, useEffect } from 'react';
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

  return {
    purchases,
    loading,
    hasPurchased,
    createPurchase,
    refetch: fetchPurchases
  };
}
