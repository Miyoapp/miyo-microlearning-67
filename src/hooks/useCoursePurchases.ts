
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
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('compras_cursos')
        .select('*')
        .eq('user_id', user.id)
        .eq('estado_pago', 'completado');

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: CoursePurchase[] = (data || []).map(item => ({
        id: item.id,
        course_id: item.curso_id,
        fecha_compra: item.fecha_compra,
        monto_pagado: item.monto_pagado,
        estado_pago: item.estado_pago
      }));
      
      setPurchases(transformedData);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPurchased = (courseId: string) => {
    return purchases.some(p => p.course_id === courseId);
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
