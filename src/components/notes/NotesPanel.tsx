
import React, { useState } from 'react';
import { LessonNote } from '@/types/notes';
import { StickyNote, Plus, Clock, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotesPanelProps {
  isOpen: boolean;
  notes: LessonNote[];
  onAddNote: (noteText: string) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (noteId: string, noteText: string) => void;
  onSeekToTime: (timeInSeconds: number) => void;
  currentTimeSeconds: number;
}

const NotesPanel: React.FC<NotesPanelProps> = ({
  isOpen,
  notes,
  onAddNote,
  onDeleteNote,
  onEditNote,
  onSeekToTime,
  currentTimeSeconds
}) => {
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Format time helper
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAddNote = () => {
    if (newNoteText.trim()) {
      onAddNote(newNoteText.trim());
      setNewNoteText('');
      setShowNoteForm(false);
    }
  };

  const handleCancelNote = () => {
    setNewNoteText('');
    setShowNoteForm(false);
  };

  const handleEditNote = (noteId: string, currentText: string) => {
    setEditingNoteId(noteId);
    setEditingText(currentText);
  };

  const handleSaveEdit = () => {
    if (editingNoteId && editingText.trim()) {
      onEditNote(editingNoteId, editingText.trim());
      setEditingNoteId(null);
      setEditingText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingText('');
  };

  const handleSeekToNote = (timeInSeconds: number) => {
    onSeekToTime(timeInSeconds);
  };

  return (
    <div 
      className={cn(
        "bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-96" : "max-h-0"
      )}
    >
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote size={18} className="text-[#5e16ea]" />
            <h4 className="font-medium text-gray-900">📝 Mis notas</h4>
            <span className="text-xs text-gray-500">({notes.length})</span>
          </div>
          <button
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="flex items-center gap-2 bg-[#5e16ea] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#4a11ba] transition-colors"
          >
            <Plus size={14} />
            Agregar nota
          </button>
        </div>

        {/* Add Note Form */}
        {showNoteForm && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-[#5e16ea] font-medium">
              <Clock size={14} />
              📍 En {formatTime(currentTimeSeconds)}
            </div>
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="¿Qué insight tuviste en este momento?"
              className="w-full text-sm border border-gray-200 rounded-md p-3 resize-none focus:ring-2 focus:ring-[#5e16ea] focus:border-[#5e16ea] min-h-[60px]"
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddNote}
                disabled={!newNoteText.trim()}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  newNoteText.trim()
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                Guardar
              </button>
              <button
                onClick={handleCancelNote}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <StickyNote size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aún no tienes notas en esta lección</p>
              <p className="text-xs mt-1">Haz clic en "Agregar nota" para crear una</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-gray-50 border-l-4 border-[#5e16ea] rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleSeekToNote(note.timestamp_seconds)}
                    className="text-sm text-[#5e16ea] font-medium hover:underline transition-colors"
                  >
                    📍 {formatTime(note.timestamp_seconds)} - Saltar a este momento
                  </button>
                  
                  {editingNoteId !== note.id && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditNote(note.id, note.note_text)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
                
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-md p-2 resize-none min-h-[60px]"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-md hover:bg-emerald-600 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-xs text-gray-600 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">{note.note_text}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
