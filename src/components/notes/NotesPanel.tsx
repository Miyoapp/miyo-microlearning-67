
import React, { useState } from 'react';
import { LessonNote, NOTE_TAGS } from '@/types/notes';
import { Heart, Clock, Tag, Trash2, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotesPanelProps {
  isOpen: boolean;
  notes: LessonNote[];
  onAddNote: (noteText: string) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (noteId: string, updates: Partial<Pick<LessonNote, 'note_text' | 'tags' | 'is_favorite'>>) => void;
  onSeekToTime: (timeInSeconds: number) => void;
  currentTimeSeconds: number;
}

const NotesPanel = ({
  isOpen,
  notes,
  onAddNote,
  onDeleteNote,
  onEditNote,
  onSeekToTime,
  currentTimeSeconds
}: NotesPanelProps) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [showAddNoteArea, setShowAddNoteArea] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAddNote = () => {
    if (newNoteText.trim()) {
      onAddNote(newNoteText.trim());
      setNewNoteText('');
      setShowAddNoteArea(false);
    }
  };

  const handleStartEdit = (note: LessonNote) => {
    setEditingNoteId(note.id);
    setEditText(note.note_text);
  };

  const handleSaveEdit = () => {
    if (editingNoteId) {
      onEditNote(editingNoteId, { 
        note_text: editText
      });
      setEditingNoteId(null);
      setEditText('');
    }
  };

  const handleToggleFavorite = (note: LessonNote) => {
    onEditNote(note.id, { is_favorite: !note.is_favorite });
  };

  if (!isOpen) return null;

  return (
    <div className="border-t border-gray-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 flex items-center">
            <span className="mr-2">📝</span>
            Notas de la lección ({notes.length})
          </h4>
          <button
            onClick={() => setShowAddNoteArea(true)}
            className="px-3 py-1.5 bg-[#5e16ea] text-white text-sm rounded-md hover:bg-[#4a11ba] transition-colors"
          >
            + Agregar nota
          </button>
        </div>

        {/* Add new note area */}
        {showAddNoteArea && (
          <div className="space-y-2">
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <Clock size={12} className="mr-1" />
              Tiempo actual: {formatTime(currentTimeSeconds)}
            </div>
            
            <div className="flex space-x-2">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Escribe tu nota aquí..."
                className="flex-1 text-sm border border-yellow-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex flex-col space-y-1">
                <button
                  onClick={handleAddNote}
                  disabled={!newNoteText.trim()}
                  className="px-3 py-2 bg-[#5e16ea] text-white text-xs rounded-md hover:bg-[#4a11ba] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setShowAddNoteArea(false);
                    setNewNoteText('');
                  }}
                  className="px-3 py-2 bg-gray-300 text-gray-600 text-xs rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes list */}
        {notes.length > 0 && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notes
              .sort((a, b) => a.timestamp_seconds - b.timestamp_seconds)
              .map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-lg border border-yellow-200 p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Note header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <button
                        onClick={() => onSeekToTime(note.timestamp_seconds)}
                        className="flex items-center text-xs text-yellow-600 hover:text-yellow-700 transition-colors"
                      >
                        <Clock size={12} className="mr-1" />
                        {formatTime(note.timestamp_seconds)}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleFavorite(note)}
                        className={cn(
                          "p-1 rounded transition-colors",
                          note.is_favorite 
                            ? "text-red-500 hover:text-red-600" 
                            : "text-gray-400 hover:text-red-500"
                        )}
                      >
                        <Heart size={12} fill={note.is_favorite ? "currentColor" : "none"} />
                      </button>
                      
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit3 size={12} />
                      </button>
                      
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Note content */}
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 resize-none"
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
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

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1 mt-2">
                      <Tag size={10} className="text-gray-400" />
                      {note.tags.map((tagId) => {
                        const tag = NOTE_TAGS.find(t => t.id === tagId);
                        return tag ? (
                          <span
                            key={tagId}
                            className={cn(
                              "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border",
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
              ))}
          </div>
        )}

        {notes.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <div className="text-2xl mb-2">📝</div>
            <p className="text-sm">Aún no hay notas para esta lección</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPanel;
