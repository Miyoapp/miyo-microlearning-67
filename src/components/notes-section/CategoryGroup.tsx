
import React, { useState } from 'react';
import { EnrichedNote } from '@/types/notes';
import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CourseGroup from './CourseGroup';

interface CategoryGroupProps {
  categoryName: string;
  notes: EnrichedNote[];
  onEditNote: (note: EnrichedNote) => void;
  onDeleteNote: (noteId: string) => void;
  onToggleFavorite: (noteId: string, isFavorite: boolean) => void;
  onNavigateToLesson: (note: EnrichedNote) => void;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({
  categoryName,
  notes,
  onEditNote,
  onDeleteNote,
  onToggleFavorite,
  onNavigateToLesson
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Agrupar notas por curso
  const notesByCourse = notes.reduce((acc, note) => {
    const courseKey = `${note.course_id}-${note.course_title}`;
    if (!acc[courseKey]) {
      acc[courseKey] = {
        title: note.course_title,
        image: note.course_image,
        notes: []
      };
    }
    acc[courseKey].notes.push(note);
    return acc;
  }, {} as Record<string, { title: string; image: string; notes: EnrichedNote[] }>);

  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-start p-4 h-auto bg-gray-50 hover:bg-gray-100 rounded-lg"
      >
        <div className="flex items-center gap-3 w-full">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <Folder size={18} className="text-primary" />
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-gray-900 text-lg">{categoryName}</h3>
            <p className="text-sm text-gray-600">
              {notes.length} nota{notes.length !== 1 ? 's' : ''} en {Object.keys(notesByCourse).length} curso{Object.keys(notesByCourse).length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </Button>

      {isExpanded && (
        <div className="ml-4 mt-4 space-y-2">
          {Object.entries(notesByCourse).map(([courseKey, courseData]) => (
            <CourseGroup
              key={courseKey}
              courseTitle={courseData.title}
              courseImage={courseData.image}
              notes={courseData.notes}
              onEditNote={onEditNote}
              onDeleteNote={onDeleteNote}
              onToggleFavorite={onToggleFavorite}
              onNavigateToLesson={onNavigateToLesson}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryGroup;
