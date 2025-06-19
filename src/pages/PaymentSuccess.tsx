
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

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId || !preferenceId) {
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-mercadopago-payment', {
          body: {
            payment_id: paymentId,
            preference_id: preferenceId
          }
        });

        if (error) throw error;

        if (data.success && data.status === 'approved') {
          setVerified(true);
          toast.success('¡Pago confirmado! Ya tienes acceso al curso.');
        } else {
          toast.error('El pago está pendiente de confirmación.');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast.error('Error al verificar el pago.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [paymentId, preferenceId]);

  const handleGoToCourse = () => {
    if (externalReference) {
      const courseId = externalReference.split('-')[1];
      navigate(`/dashboard/course/${courseId}`);
    } else {
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
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleGoToCourse} 
              className="flex-1"
              disabled={!verified}
            >
              {verified ? 'Ir al curso' : 'Ir al dashboard'}
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
