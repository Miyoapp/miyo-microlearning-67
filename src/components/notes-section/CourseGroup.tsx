
import React, { useState } from 'react';
import { EnrichedNote } from '@/types/notes';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NoteItem from './NoteItem';

interface CourseGroupProps {
  courseTitle: string;
  courseImage: string;
  notes: EnrichedNote[];
  onEditNote: (note: EnrichedNote) => void;
  onDeleteNote: (noteId: string) => void;
  onToggleFavorite: (noteId: string, isFavorite: boolean) => void;
  onNavigateToLesson: (note: EnrichedNote) => void;
}

const CourseGroup: React.FC<CourseGroupProps> = ({
  courseTitle,
  courseImage,
  notes,
  onEditNote,
  onDeleteNote,
  onToggleFavorite,
  onNavigateToLesson
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-start p-3 h-auto hover:bg-gray-50"
      >
        <div className="flex items-center gap-3 w-full">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <img
            src={courseImage}
            alt={courseTitle}
            className="w-8 h-8 rounded object-cover"
          />
          <div className="flex-1 text-left">
            <h4 className="font-medium text-gray-900">{courseTitle}</h4>
            <p className="text-sm text-gray-500">{notes.length} nota{notes.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </Button>

      {isExpanded && (
        <div className="ml-6 space-y-3 mt-2">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onEdit={onEditNote}
              onDelete={onDeleteNote}
              onToggleFavorite={onToggleFavorite}
              onNavigateToLesson={onNavigateToLesson}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseGroup;
