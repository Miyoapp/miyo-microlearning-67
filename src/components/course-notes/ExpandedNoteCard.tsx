
import React, { useState } from 'react';
import { LessonNote, NOTE_TAGS } from '@/types/notes';
import { Heart, Clock, Tag, Trash2, Edit3 } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { cn } from '@/lib/utils';

interface ExpandedNoteCardProps {
  note: LessonNote;
}

const ExpandedNoteCard = ({ note }: ExpandedNoteCardProps) => {
  const { updateNote, deleteNote } = useNotes(note.lesson_id, note.course_id);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.note_text);
  const [editTitle, setEditTitle] = useState(note.note_title || '');

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleToggleFavorite = () => {
    updateNote(note.id, { is_favorite: !note.is_favorite });
  };

  const handleSaveEdit = () => {
    updateNote(note.id, { 
      note_text: editText, 
      note_title: editTitle || undefined 
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      deleteNote(note.id);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Título de la nota (opcional)"
              className="w-full text-sm font-medium border border-gray-300 rounded px-2 py-1 mb-2"
            />
          ) : (
            note.note_title && (
              <h4 className="font-medium text-gray-900 mb-1">{note.note_title}</h4>
            )
          )}
          
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center">
              <Clock size={12} className="mr-1" />
              {formatTime(note.timestamp_seconds)}
            </div>
            <div>
              {new Date(note.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleFavorite}
            className={cn(
              "p-1 rounded transition-colors",
              note.is_favorite 
                ? "text-red-500 hover:text-red-600" 
                : "text-gray-400 hover:text-red-500"
            )}
          >
            <Heart size={14} fill={note.is_favorite ? "currentColor" : "none"} />
          </button>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Edit3 size={14} />
          </button>
          
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 resize-none"
              rows={3}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 text-xs bg-[#5e16ea] text-white rounded hover:bg-[#4a11ba] transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(note.note_text);
                  setEditTitle(note.note_title || '');
                }}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {note.note_text}
          </p>
        )}
      </div>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex items-center flex-wrap gap-2">
          <Tag size={12} className="text-gray-400" />
          {note.tags.map((tagId) => {
            const tag = NOTE_TAGS.find(t => t.id === tagId);
            return tag ? (
              <span
                key={tagId}
                className={cn(
                  "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border",
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
    </div>
  );
};

export default ExpandedNoteCard;
