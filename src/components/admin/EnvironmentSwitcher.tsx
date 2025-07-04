
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { databaseConfig, getCurrentEnvironment } from '@/config/database';

const EnvironmentSwitcher: React.FC = () => {
  const handleShowConfig = () => {
    const config = getCurrentEnvironment();
    console.table(config);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-3 rounded-lg shadow-lg border">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">Ambiente:</span>
        <Badge 
          variant={databaseConfig.environment === 'production' ? 'destructive' : 'secondary'}
        >
          {databaseConfig.environment}
        </Badge>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleShowConfig}
        className="w-full"
      >
        Ver Configuración
      </Button>
    </div>
  );
};

export default EnvironmentSwitcher;
