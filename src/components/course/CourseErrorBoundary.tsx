
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseErrorBoundaryProps {
  error?: string | null;
  courseId?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

const CourseErrorBoundary: React.FC<CourseErrorBoundaryProps> = ({
  error,
  courseId,
  onRetry,
  children
}) => {
  const navigate = useNavigate();

  if (!error) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Error al cargar el curso
        </h2>
        <p className="text-gray-600 mb-6">
          {error}
        </p>
        {courseId && (
          <p className="text-xs text-gray-400 mb-6">
            ID del curso: {courseId}
          </p>
        )}
        
        <div className="space-y-3">
          {onRetry && (
            <Button 
              onClick={onRetry}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          )}
          
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseErrorBoundary;
