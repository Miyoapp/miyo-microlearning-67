
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
    <div className="absolute inset-0 rounded-lg z-10 premium-overlay" style={{
      background: 'rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(1px)',
      pointerEvents: 'all'
    }}>
      {/* Subtle overlay content */}
      <div className="absolute top-4 right-4">
        <div className="bg-white/95 rounded-lg shadow-lg p-3 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold">Premium</span>
          </div>
          <Button onClick={onUnlock} size="sm" className="w-full">
            <Lock className="w-3 h-3 mr-1" />
            {formatCurrency(price, currency)}
          </Button>
        </div>
      </div>
      
      {/* Center message for larger areas */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-4 max-w-xs bg-white/90 rounded-xl shadow-lg backdrop-blur-md">
          <Crown className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
          <h3 className="text-lg font-bold mb-2">Contenido Premium</h3>
          <p className="text-gray-600 text-sm mb-3">
            Desbloquea este curso para acceder a todas las lecciones
          </p>
          <Button onClick={onUnlock} className="w-full">
            <Lock className="w-4 h-4 mr-2" />
            Desbloquear por {formatCurrency(price, currency)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumOverlay;
