
import React from 'react';
import { CourseWithNotes } from '@/types/notes';
import CompactCategoryGroup from './CompactCategoryGroup';

interface NotesContentListProps {
  coursesByCategory: Record<string, CourseWithNotes[]>;
}

const NotesContentList: React.FC<NotesContentListProps> = ({ coursesByCategory }) => {
  if (Object.keys(coursesByCategory).length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-gray-600">No se encontraron notas con los filtros aplicados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(coursesByCategory).map(([categoryName, courses]) => (
        <CompactCategoryGroup
          key={categoryName}
          categoryName={categoryName}
          courses={courses}
        />
      ))}
    </div>
  );
};

export default NotesContentList;
