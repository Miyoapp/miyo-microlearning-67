
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CourseWithNotes } from '@/types/notes';
import CompactCourseGroup from './CompactCourseGroup';

interface CompactCategoryGroupProps {
  categoryName: string;
  courses: CourseWithNotes[];
}

const CompactCategoryGroup: React.FC<CompactCategoryGroupProps> = ({ 
  categoryName, 
  courses 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const totalNotes = courses.reduce((sum, course) => sum + course.notesCount, 0);

  const getCategoryIcon = (name: string) => {
    const icons: Record<string, string> = {
      'Productividad': '💼',
      'Espiritualidad': '🧘',
      'Bienestar': '🌱',
      'Autoconocimiento': '🎭',
      'Negocios': '💰',
      'Tecnología': '💻'
    };
    return icons[name] || '📚';
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              {getCategoryIcon(categoryName)} {categoryName}
            </span>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
              {totalNotes} {totalNotes === 1 ? 'nota' : 'notas'}
            </span>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="animate-fade-in">
          {courses.map((course) => (
            <CompactCourseGroup key={course.courseId} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompactCategoryGroup;
