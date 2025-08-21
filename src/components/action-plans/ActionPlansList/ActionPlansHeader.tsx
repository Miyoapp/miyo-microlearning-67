
import React from 'react';

interface ActionPlansHeaderProps {
  planCount: number;
}

const ActionPlansHeader: React.FC<ActionPlansHeaderProps> = ({ planCount }) => {
  return (
    <div className="space-y-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mis Planes de Acción
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Gestiona y realiza seguimiento a todos tus planes de acción generados desde los resúmenes de cursos. 
          Marca los que hayas completado y mantén tu progreso organizado.
        </p>
      </div>
      
      <div className="flex items-center space-x-6 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎯</span>
          <span>
            {planCount} {planCount === 1 ? 'plan de acción' : 'planes de acción'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActionPlansHeader;
