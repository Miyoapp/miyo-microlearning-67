
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';

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

  const handleCheckout = async () => {
    setProcessing(true);
    
    // Simular procesamiento de pago por ahora
    setTimeout(() => {
      setProcessing(false);
      toast.success('¡Compra realizada con éxito!');
      onPurchaseComplete();
      onClose();
    }, 2000);
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
              src={course.imageUrl}
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

          {/* Payment simulation */}
          <div className="space-y-3">
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-3">
                Integración con Stripe (próximamente)
              </p>
              <Button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full"
              >
                {processing ? 'Procesando...' : `Pagar ${formatCurrency(course.precio, course.moneda)}`}
              </Button>
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
