
import React from 'react';
import { LessonNote } from '@/types/notes';
import ExpandedNoteCard from './ExpandedNoteCard';

interface LessonNotesGroupProps {
  lessonId: string;
  notes: LessonNote[];
}

const LessonNotesGroup = ({ lessonId, notes }: LessonNotesGroupProps) => {
  // Get lesson title from the first note (all notes in this group are from the same lesson)
  const lessonTitle = notes.length > 0 ? notes[0].lesson_title : null;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <h3 className="font-semibold text-gray-900">
          {lessonTitle || `Lección ${lessonId.slice(-1)}`}
        </h3>
        <span className="text-sm text-gray-500">
          ({notes.length} {notes.length === 1 ? 'nota' : 'notas'})
        </span>
      </div>
      
      <div className="space-y-3">
        {notes
          .sort((a, b) => a.timestamp_seconds - b.timestamp_seconds)
          .map((note) => (
            <ExpandedNoteCard key={note.id} note={note} />
          ))}
      </div>
    </div>
  );
};

export default LessonNotesGroup;
