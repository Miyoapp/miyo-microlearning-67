
import React, { useState } from 'react';
import { LessonNote, NOTE_TAGS } from '@/types/notes';
import { Heart, Edit3, Trash2, Clock } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import EditNoteModal from './EditNoteModal';

interface DirectNoteItemProps {
  note: LessonNote;
  courseTitle: string;
}

const DirectNoteItem: React.FC<DirectNoteItemProps> = ({ note, courseTitle }) => {
  const { updateNote, deleteNote } = useNotes(note.lesson_id, note.course_id);
  const [showActions, setShowActions] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateNote(note.id, { is_favorite: !note.is_favorite });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      deleteNote(note.id);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div 
        className={cn(
          "relative p-3 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-[#5e16ea] hover:shadow-md hover:-translate-y-0.5 group",
          note.is_favorite && "border-yellow-200 bg-yellow-50"
        )}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Actions */}
        <div className={cn(
          "absolute top-2 right-2 flex gap-1 transition-opacity duration-200",
          showActions ? "opacity-100" : "opacity-0"
        )}>
          <button
            onClick={handleToggleFavorite}
            className={cn(
              "p-1 rounded bg-white shadow-sm border transition-colors",
              note.is_favorite 
                ? "text-yellow-500 hover:bg-yellow-50" 
                : "text-gray-400 hover:text-yellow-500"
            )}
          >
            <Heart size={12} fill={note.is_favorite ? "currentColor" : "none"} />
          </button>
          
          <button
            onClick={handleEdit}
            className="p-1 rounded bg-white shadow-sm border text-gray-400 hover:text-[#5e16ea] transition-colors"
          >
            <Edit3 size={12} />
          </button>
          
          <button
            onClick={handleDelete}
            className="p-1 rounded bg-white shadow-sm border text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {note.tags.map((tagId) => {
              const tag = NOTE_TAGS.find(t => t.id === tagId);
              return tag ? (
                <span
                  key={tagId}
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                    tag.color
                  )}
                >
                  <span className="mr-1">{tag.icon}</span>
                  {tag.name}
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Note Content Preview */}
        <p className="text-sm text-gray-700 leading-relaxed mb-2 pr-16 line-clamp-2">
          {note.note_text}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Clock size={10} />
            <span>{formatTime(note.timestamp_seconds)}</span>
            <span>•</span>
            <span className="font-medium">Lección {note.lesson_id.slice(-1)}</span>
          </div>
          <span>
            {formatDistanceToNow(new Date(note.created_at), { 
              addSuffix: true, 
              locale: es 
            })}
          </span>
        </div>
      </div>

      <EditNoteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        note={note}
        courseTitle={courseTitle}
      />
    </>
  );
};

export default DirectNoteItem;
