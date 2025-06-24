
import React from 'react';
import { Loader2, BookOpen, Users, PlayCircle } from 'lucide-react';

interface LoadingState {
  course: boolean;
  purchases: boolean;
  overall: boolean;
}

interface CourseLoadingDetailedProps {
  loadingState: LoadingState;
  courseId?: string;
}

const CourseLoadingDetailed: React.FC<CourseLoadingDetailedProps> = ({
  loadingState,
  courseId
}) => {
  const loadingSteps = [
    {
      key: 'course',
      label: 'Cargando información del curso',
      icon: BookOpen,
      isLoading: loadingState.course
    },
    {
      key: 'purchases',
      label: 'Verificando acceso',
      icon: Users,
      isLoading: loadingState.purchases
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Cargando curso
        </h2>
        
        {courseId && (
          <p className="text-sm text-gray-500 mb-6">
            ID: {courseId}
          </p>
        )}
        
        <div className="space-y-3">
          {loadingSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.key}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  step.isLoading 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'bg-gray-50 text-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${step.isLoading ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium">{step.label}</span>
                {step.isLoading && (
                  <Loader2 className="w-4 h-4 ml-auto animate-spin" />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">
            Si el problema persiste, intenta recargar la página o contactar soporte.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseLoadingDetailed;
