
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseWithNotes } from '@/types/notes';

interface CourseNotesHeaderProps {
  course: CourseWithNotes;
}

const CourseNotesHeader = ({ course }: CourseNotesHeaderProps) => {
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600">
        <Link 
          to="/dashboard/mis-notas" 
          className="hover:text-[#5e16ea] transition-colors"
        >
          Mis Notas
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-400">{course.categoryName}</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">{course.courseTitle}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Link 
              to="/dashboard/mis-notas" 
              className="inline-flex items-center text-[#5e16ea] hover:text-[#4a11ba] transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {course.courseTitle}
            </h1>
          </div>
          <p className="text-gray-600">
            {course.notesCount} {course.notesCount === 1 ? 'nota' : 'notas'} • {course.categoryName}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseNotesHeader;
