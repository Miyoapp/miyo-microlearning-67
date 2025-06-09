
import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumOverlayProps {
  onUnlock: () => void;
  price: number;
  currency?: string;
}

const PremiumOverlay: React.FC<PremiumOverlayProps> = ({ onUnlock, price, currency = 'USD' }) => {
  const formatCurrency = (amount: number, curr: string) => {
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

  return (
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center rounded-lg z-10 premium-overlay">
      <div className="text-center p-6 max-w-sm bg-white/95 rounded-xl shadow-lg backdrop-blur-md">
        <div className="mb-4">
          <Crown className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
          <h3 className="text-xl font-bold mb-2">Contenido Premium</h3>
          <p className="text-gray-600 text-sm">
            Desbloquea este curso para acceder a todas las lecciones y contenido exclusivo
          </p>
        </div>
        
        <Button onClick={onUnlock} className="w-full">
          <Lock className="w-4 h-4 mr-2" />
          Desbloquear por {formatCurrency(price, currency)}
        </Button>
      </div>
    </div>
  );
};

export default PremiumOverlay;
