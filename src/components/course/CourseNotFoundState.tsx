
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CourseNotFoundStateProps {
  courseId?: string;
  onRetry: () => void;
  onGoBack: () => void;
}

const CourseNotFoundState: React.FC<CourseNotFoundStateProps> = ({
  courseId,
  onRetry,
  onGoBack
}) => {
  return (
    <div className="text-center py-20 px-4">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
        Curso no encontrado
      </h2>
      <p className="text-sm sm:text-base text-gray-600 mb-6">
        El curso que buscas no existe o no está disponible.
      </p>
      {courseId && (
        <p className="text-xs text-gray-500 mb-6">ID del curso: {courseId}</p>
      )}
      <Button onClick={onRetry} className="mr-4">
        <RefreshCw className="h-4 w-4 mr-2" />
        Buscar de nuevo
      </Button>
      <Button variant="outline" onClick={onGoBack}>
        Volver
      </Button>
    </div>
  );
};

export default CourseNotFoundState;
