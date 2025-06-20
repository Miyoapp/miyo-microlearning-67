
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMercadoPago() {
  const [processing, setProcessing] = useState(false);

  const createCheckout = async (courseId: string, amount: number, currency = 'ARS') => {
    setProcessing(true);
    
    try {
      // 🔍 Debug: Check authentication state
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔐 Authentication Debug - useMercadoPago:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        sessionError,
        accessToken: session?.access_token ? 'Present' : 'Missing'
      });

      if (!session || !session.access_token) {
        console.error('❌ No valid session or access token found');
        toast.error('Debes iniciar sesión para continuar');
        throw new Error('No authenticated session');
      }

      console.log('💳 Creating checkout with parameters:', { courseId, amount, currency });

      const { data, error } = await supabase.functions.invoke('create-mercadopago-checkout', {
        body: {
          courseId,
          amount,
          currency
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      console.log('💳 Checkout response:', { data, error });

      if (error) {
        console.error('❌ Error from checkout function:', error);
        throw error;
      }

      if (data.success && data.init_point) {
        console.log('✅ Checkout created successfully:', data.init_point);
        return data.init_point;
      } else {
        console.error('❌ Invalid response from checkout function:', data);
        throw new Error('Error al crear el checkout');
      }
    } catch (error) {
      console.error('❌ Error creating checkout:', error);
      toast.error('Error al procesar el pago. Inténtalo de nuevo.');
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const verifyPayment = async (paymentId: string, preferenceId: string) => {
    try {
      // 🔍 Debug: Check authentication state for verification
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔐 Authentication Debug - verifyPayment:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        sessionError,
        accessToken: session?.access_token ? 'Present' : 'Missing'
      });

      const headers = session?.access_token ? {
        Authorization: `Bearer ${session.access_token}`,
      } : {};

      const { data, error } = await supabase.functions.invoke('verify-mercadopago-payment', {
        body: {
          payment_id: paymentId,
          preference_id: preferenceId
        },
        headers
      });

      console.log('🔍 Payment verification response:', { data, error });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
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
