
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  const paymentId = searchParams.get('payment_id');
  const preferenceId = searchParams.get('preference_id');
  const externalReference = searchParams.get('external_reference');

  console.log('💳 Payment Success Page - URL Params:', {
    paymentId,
    preferenceId,
    externalReference
  });

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId || !preferenceId) {
        console.log('⚠️ Missing payment parameters');
        setIsVerifying(false);
        return;
      }

      try {
        console.log('🔍 Verifying payment with Supabase function...');
        
        const { data, error } = await supabase.functions.invoke('verify-mercadopago-payment', {
          body: {
            payment_id: paymentId,
            preference_id: preferenceId
          }
        });

        console.log('🔍 Verification result:', { data, error });

        if (error) throw error;

        if (data.success && data.status === 'approved') {
          console.log('✅ Payment verified and approved');
          setVerified(true);
          toast.success('¡Pago confirmado! Ya tienes acceso al curso.');
          
          // Add a delay to allow the webhook to process
          setTimeout(() => {
            console.log('⏰ Redirecting after verification delay...');
          }, 2000);
        } else {
          console.log('⏳ Payment pending confirmation');
          toast.error('El pago está pendiente de confirmación.');
        }
      } catch (error) {
        console.error('❌ Error verifying payment:', error);
        toast.error('Error al verificar el pago.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [paymentId, preferenceId]);

  const handleGoToCourse = () => {
    let courseId = null;
    
    // Try to extract course ID from external_reference
    if (externalReference) {
      const parts = externalReference.split('-');
      if (parts.length >= 2) {
        courseId = parts[1];
        console.log('📋 Extracted course ID from external_reference:', courseId);
      }
    }
    
    if (courseId) {
      console.log('🎯 Navigating to course:', courseId);
      navigate(`/dashboard/course/${courseId}`);
    } else {
      console.log('🏠 No course ID found, navigating to dashboard');
      navigate('/dashboard');
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
              <h2 className="text-xl font-semibold mb-2">Verificando pago...</h2>
              <p className="text-gray-600">Por favor espera mientras confirmamos tu pago.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <CardTitle className="text-2xl">¡Pago Exitoso!</CardTitle>
          <CardDescription>
            {verified 
              ? 'Tu pago ha sido confirmado y ya tienes acceso al curso.'
              : 'Tu pago está siendo procesado. Recibirás una confirmación pronto.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            {paymentId && (
              <p className="text-sm text-gray-600">
                ID de pago: <span className="font-mono">{paymentId}</span>
              </p>
            )}
            {externalReference && (
              <p className="text-sm text-gray-600">
                Referencia: <span className="font-mono">{externalReference}</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleGoToCourse} 
              className="flex-1"
            >
              {verified && externalReference ? 'Ir al curso' : 'Ir al dashboard'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
