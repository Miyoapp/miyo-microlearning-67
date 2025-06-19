
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMercadoPago() {
  const [processing, setProcessing] = useState(false);

  const createCheckout = async (courseId: string, amount: number, currency = 'ARS') => {
    setProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-mercadopago-checkout', {
        body: {
          courseId,
          amount,
          currency
        }
      });

      if (error) throw error;

      if (data.success && data.init_point) {
        return data.init_point;
      } else {
        throw new Error('Error al crear el checkout');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Error al procesar el pago. Inténtalo de nuevo.');
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const verifyPayment = async (paymentId: string, preferenceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-mercadopago-payment', {
        body: {
          payment_id: paymentId,
          preference_id: preferenceId
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Error al verificar el pago.');
      throw error;
    }
  };

  return {
    createCheckout,
    verifyPayment,
    processing
  };
}
