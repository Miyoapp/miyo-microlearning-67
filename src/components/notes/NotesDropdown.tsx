
import React, { useState, useEffect, useRef } from 'react';
import { LessonNote } from '@/types/notes';
import { StickyNote, Plus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notes: LessonNote[];
  onAddNote: (noteText: string) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (noteId: string, noteText: string) => void; // Mantener signature original
  onSeekToTime: (timeInSeconds: number) => void;
  currentTimeSeconds: number;
}

const NotesDropdown: React.FC<NotesDropdownProps> = ({
  isOpen,
  onClose,
  notes,
  onAddNote,
  onDeleteNote,
  onEditNote,
  onSeekToTime,
  currentTimeSeconds
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Format time helper
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const handleAddNote = () => {
    if (newNoteText.trim()) {
      onAddNote(newNoteText.trim());
      setNewNoteText('');
    }
  };

  const handleEditNote = (noteId: string, currentText: string) => {
    setEditingNoteId(noteId);
    setEditingText(currentText);
  };

  const handleSaveEdit = () => {
    if (editingNoteId && editingText.trim()) {
      // Usar la signature original (noteId, noteText)
      onEditNote(editingNoteId, editingText.trim());
      setEditingNoteId(null);
      setEditingText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingText('');
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto animate-fade-in"
    >
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote size={18} className="text-[#5e16ea]" />
            <h3 className="font-medium text-gray-900">📝 Mis notas</h3>
          </div>
          <span className="text-xs text-gray-500">{notes.length} notas</span>
        </div>
      </div>

      {/* Notes List */}
      <div className="p-4 space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <StickyNote size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No tienes notas en esta lección</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock size={12} />
                  <span>{formatTime(note.timestamp_seconds)}</span>
                </div>
                <button
                  onClick={() => onSeekToTime(note.timestamp_seconds)}
                  className="text-xs text-[#5e16ea] hover:underline"
                >
                  Saltar a este momento
                </button>
              </div>
              
              {editingNoteId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full text-sm border rounded-md p-2 resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="text-xs bg-[#5e16ea] text-white px-3 py-1 rounded-md hover:bg-[#4a11ba]"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-xs text-gray-600 px-3 py-1 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-800">{note.note_text}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditNote(note.id, note.note_text)}
                      className="text-xs text-gray-600 hover:text-[#5e16ea]"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Note Form */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock size={14} />
            <span>Nota en {formatTime(currentTimeSeconds)}</span>
          </div>
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Escribe tu nota aquí..."
            className="w-full text-sm border rounded-md p-3 resize-none focus:ring-2 focus:ring-[#5e16ea] focus:border-[#5e16ea]"
            rows={2}
          />
          <button
            onClick={handleAddNote}
            disabled={!newNoteText.trim()}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md transition-colors",
              newNoteText.trim()
                ? "bg-[#5e16ea] text-white hover:bg-[#4a11ba]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            <Plus size={16} />
            Agregar nota
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesDropdown;
