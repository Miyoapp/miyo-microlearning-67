
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface CoursePageHeaderProps {
  isReviewMode?: boolean;
}

const CoursePageHeader: React.FC<CoursePageHeaderProps> = ({ isReviewMode }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 sm:mb-8 px-4 sm:px-0">
      {/* Back arrow button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-[#5E17EA] mb-4 transition-colors group"
      >
        <ChevronLeft 
          size={24} 
          className="mr-1 text-[#5E17EA] group-hover:translate-x-[-2px] transition-transform" 
        />
      </button>

      {isReviewMode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">✓</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                ¡Curso Completado!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Has terminado este curso. Puedes repasar las lecciones cuando quieras.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePageHeader;
