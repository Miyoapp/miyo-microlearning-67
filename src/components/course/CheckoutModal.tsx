
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock, Shield, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getOptimizedCloudinaryUrl, CloudinaryPresets } from '@/utils/cloudinary';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    precio: number;
    imageUrl: string;
    moneda?: string;
  };
  onPurchaseComplete: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  course,
  onPurchaseComplete
}) => {
  const [processing, setProcessing] = useState(false);

  const formatCurrency = (amount: number, currency?: string) => {
    const curr = currency || 'USD';
    switch (curr) {
      case 'USD':
        return `$${amount.toFixed(2)}`;
      case 'EUR':
        return `€${amount.toFixed(2)}`;
      case 'MXN':
        return `$${amount.toFixed(2)} MXN`;
      case 'ARS':
        return `$${amount.toFixed(0)} ARS`;
      case 'PEN':
        return `S/${amount.toFixed(2)}`;
      default:
        return `${curr} $${amount.toFixed(2)}`;
    }
  };

  const handleMercadoPagoCheckout = async () => {
    setProcessing(true);
    
    try {
      // 🔍 Debug: Check authentication state
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔐 Authentication Debug - CheckoutModal:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        sessionError,
        accessToken: session?.access_token ? 'Present' : 'Missing'
      });

      if (!session || !session.access_token) {
        console.error('❌ No valid session or access token found');
        toast.error('Debes iniciar sesión para continuar');
        setProcessing(false);
        return;
      }

      console.log('💳 Creating MercadoPago checkout with explicit auth header');
      
      const { data, error } = await supabase.functions.invoke('create-mercadopago-checkout', {
        body: {
          courseId: course.id,
          amount: course.precio,
          currency: course.moneda || 'ARS'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      console.log('💳 MercadoPago checkout response:', { data, error });

      if (error) {
        console.error('❌ Error from checkout function:', error);
        throw error;
      }

      if (data.success && data.init_point) {
        console.log('✅ Redirecting to MercadoPago:', data.init_point);
        // Redirect to Mercado Pago checkout
        window.location.href = data.init_point;
      } else {
        console.error('❌ Invalid response from checkout function:', data);
        throw new Error('Error al crear el checkout');
      }
    } catch (error) {
      console.error('❌ Error creating checkout:', error);
      toast.error('Error al procesar el pago. Inténtalo de nuevo.');
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Desbloquear Curso Premium
          </DialogTitle>
          <DialogDescription>
            Obtén acceso completo a este curso y todos sus contenidos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Course preview */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={getOptimizedCloudinaryUrl(course.imageUrl, CloudinaryPresets.THUMBNAIL)}
              alt={course.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-sm">{course.title}</h4>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(course.precio, course.moneda)}
              </p>
            </div>
          </div>

          {/* Mercado Pago payment */}
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <img 
                  src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.4.1/mercadolibre/logo__large_plus.png" 
                  alt="Mercado Pago" 
                  className="h-6"
                />
                <span className="text-sm font-medium">Pago seguro con Mercado Pago</span>
              </div>
              
              <Button
                onClick={handleMercadoPagoCheckout}
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {processing ? (
                  'Procesando...'
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Pagar {formatCurrency(course.precio, course.moneda)}
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-500 mt-2">
                Serás redirigido a Mercado Pago para completar tu pago de forma segura
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Pago seguro y encriptado</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
