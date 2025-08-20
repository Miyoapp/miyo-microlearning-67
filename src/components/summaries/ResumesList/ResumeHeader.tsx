
import React from 'react';

interface ResumeHeaderProps {
  resumeCount: number;
}

const ResumeHeader: React.FC<ResumeHeaderProps> = ({ resumeCount }) => {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Mis Resúmenes Personalizados
      </h1>
      <p className="text-gray-600 mb-1">
        Todos los resúmenes que has creado al completar tus cursos
      </p>
      <div className="text-sm font-semibold text-miyo-600">
        {resumeCount} resúmenes creados
      </div>
    </header>
  );
};

export default ResumeHeader;
