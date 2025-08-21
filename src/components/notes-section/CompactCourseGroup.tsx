
import React from 'react';
import { CourseWithNotes } from '@/types/notes';
import DirectNoteItem from './DirectNoteItem';

interface CompactCourseGroupProps {
  course: CourseWithNotes;
}

const CompactCourseGroup: React.FC<CompactCourseGroupProps> = ({ course }) => {
  return (
    <div className="ml-6 mb-4">
      <div className="flex items-center gap-2 py-2 px-4 bg-gray-50 border-l-3 border-l-[#5e16ea] mb-2">
        <h4 className="text-sm font-medium text-gray-700">{course.courseTitle}</h4>
        <span className="text-xs text-gray-500">
          ({course.notesCount} {course.notesCount === 1 ? 'nota' : 'notas'})
        </span>
      </div>
      
      <div className="space-y-2 ml-4">
        {course.notes
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((note) => (
            <DirectNoteItem 
              key={note.id} 
              note={note} 
              courseTitle={course.courseTitle}
            />
          ))}
      </div>
    </div>
  );
};

export default CompactCourseGroup;
