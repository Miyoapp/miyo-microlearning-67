
import React from 'react';
import { Crown } from 'lucide-react';
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
      background: 'rgba(0, 0, 0, 0.08)',
      backdropFilter: 'blur(0.5px)',
      pointerEvents: 'all'
    }}>
      {/* Only center message - removed top-right button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-6 max-w-sm bg-white/95 rounded-xl shadow-lg backdrop-blur-md">
          <Crown className="w-10 h-10 mx-auto text-yellow-500 mb-3" />
          <h3 className="text-xl font-bold mb-3">Contenido Premium</h3>
          <p className="text-gray-600 text-sm mb-4">
            Desbloquea este curso para acceder a todas las lecciones
          </p>
          <Button onClick={onUnlock} size="lg" className="w-full">
            Desbloquear por {formatCurrency(price, currency)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumOverlay;
