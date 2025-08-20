
import React from 'react';
import { EnrichedSummary } from '@/hooks/useAllSummaries';
import ResumeCard from './ResumeCard';

interface CategoryGroupProps {
  category: {
    name: string;
    icon: string;
  };
  resumes: EnrichedSummary[];
  onDelete: (summaryId: string) => void;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({ category, resumes, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {category.icon} {category.name}
        </div>
        <div className="text-sm text-gray-600">
          {resumes.length} {resumes.length === 1 ? 'resumen' : 'resúmenes'}
        </div>
      </div>
      
      <div>
        {resumes.map(resume => (
          <ResumeCard 
            key={resume.id} 
            resume={resume} 
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryGroup;
