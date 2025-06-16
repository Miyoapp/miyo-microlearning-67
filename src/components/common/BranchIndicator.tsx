
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { GitBranch } from 'lucide-react';

const BranchIndicator = () => {
  const [currentBranch, setCurrentBranch] = useState<string>('main');

  useEffect(() => {
    // En un entorno real, esto obtendría la rama actual del contexto de Git
    // Por ahora, simulamos detectar la rama basándose en la URL o configuración
    const detectBranch = () => {
      // Intentar detectar la rama desde variables de entorno o URL
      const hostname = window.location.hostname;
      
      // Si está en un dominio de producción o contiene 'production'
      if (hostname.includes('production') || 
          hostname.includes('prod') || 
          process.env.NODE_ENV === 'production') {
        return 'production';
      }
      
      // Por defecto asumimos que estamos en main/development
      return 'main';
    };

    setCurrentBranch(detectBranch());
  }, []);

  const getBranchStyle = (branch: string) => {
    if (branch === 'production') {
      return {
        variant: 'default' as const,
        className: 'bg-green-600 hover:bg-green-700 text-white border-green-600'
      };
    }
    return {
      variant: 'secondary' as const,
      className: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
    };
  };

  const style = getBranchStyle(currentBranch);

  return (
    <Badge 
      variant={style.variant}
      className={`flex items-center gap-1 px-2 py-1 text-xs font-medium ${style.className}`}
    >
      <GitBranch className="w-3 h-3" />
      <span>{currentBranch}</span>
    </Badge>
  );
};

export default BranchIndicator;
