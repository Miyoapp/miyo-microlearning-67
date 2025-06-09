
import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumOverlayProps {
  onUnlock: () => void;
  price: number;
}

const PremiumOverlay: React.FC<PremiumOverlayProps> = ({ onUnlock, price }) => {
  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
      <div className="text-center p-6 max-w-sm">
        <div className="mb-4">
          <Crown className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
          <h3 className="text-xl font-bold mb-2">Contenido Premium</h3>
          <p className="text-gray-600 text-sm">
            Desbloquea este curso para acceder a todas las lecciones y contenido exclusivo
          </p>
        </div>
        
        <Button onClick={onUnlock} className="w-full">
          <Lock className="w-4 h-4 mr-2" />
          Desbloquear por ${price}
        </Button>
      </div>
    </div>
  );
};

export default PremiumOverlay;
