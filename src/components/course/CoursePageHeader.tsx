
import React from 'react';

interface CoursePageHeaderProps {
  isReviewMode: boolean;
}

const CoursePageHeader: React.FC<CoursePageHeaderProps> = ({ isReviewMode }) => {
  if (!isReviewMode) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <div className="text-yellow-800">
          <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <strong>Modo Repaso:</strong> Este curso está completado al 100%. Puedes escuchar las lecciones sin afectar tu progreso.
        </div>
      </div>
    </div>
  );
};

export default CoursePageHeader;
