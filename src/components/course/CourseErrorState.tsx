
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface CourseErrorStateProps {
  error: string;
  onRetry: () => void;
  onGoBack: () => void;
}

const CourseErrorState: React.FC<CourseErrorStateProps> = ({
  error,
  onRetry,
  onGoBack
}) => {
  return (
    <div className="text-center py-20 px-4">
      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
        Error al cargar el curso
      </h2>
      <p className="text-sm sm:text-base text-gray-600 mb-6">
        {error || 'Ha ocurrido un error inesperado.'}
      </p>
      <Button onClick={onRetry} className="mr-4">
        <RefreshCw className="h-4 w-4 mr-2" />
        Intentar de nuevo
      </Button>
      <Button variant="outline" onClick={onGoBack}>
        Volver
      </Button>
    </div>
  );
};

export default CourseErrorState;
