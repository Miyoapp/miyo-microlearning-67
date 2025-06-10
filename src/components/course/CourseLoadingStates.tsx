
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface CourseLoadingStatesProps {
  isLoading: boolean;
  podcast: any;
}

const CourseLoadingStates: React.FC<CourseLoadingStatesProps> = ({ isLoading, podcast }) => {
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-gray-600">Cargando curso...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!podcast) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Curso no encontrado</h2>
          <p className="text-gray-600">El curso que buscas no existe o no está disponible.</p>
        </div>
      </DashboardLayout>
    );
  }

  return null;
};

export default CourseLoadingStates;
