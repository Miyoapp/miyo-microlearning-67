
import React, { useState } from 'react';
import { Play, Edit2, Trash2, Save, X } from 'lucide-react';
import { AudioNote } from '@/hooks/useAudioNotes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface LessonNotesSectionProps {
  notes: AudioNote[];
  onJumpToTime: (seconds: number) => void;
  onUpdateNote: (noteId: string, text: string) => void;
  onDeleteNote: (noteId: string) => void;
  isLoading?: boolean;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const LessonNotesSection: React.FC<LessonNotesSectionProps> = ({
  notes,
  onJumpToTime,
  onUpdateNote,
  onDeleteNote,
  isLoading = false
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleStartEdit = (note: AudioNote) => {
    setEditingNoteId(note.id);
    setEditText(note.note_text);
  };

  const handleSaveEdit = () => {
    if (editingNoteId && editText.trim()) {
      onUpdateNote(editingNoteId, editText.trim());
      setEditingNoteId(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditText('');
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h5 className="text-sm font-medium text-gray-700 mb-3">
        Mis Notas ({notes.length})
      </h5>
      
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {notes.map((note) => (
          <div key={note.id} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => onJumpToTime(note.timestamp_seconds)}
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                <Play size={12} />
                <span>{formatTime(note.timestamp_seconds)}</span>
              </button>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleStartEdit(note)}
                  disabled={editingNoteId !== null}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  disabled={editingNoteId !== null}
                  className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            
            {editingNoteId === note.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="text-sm min-h-[60px] resize-none"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                  >
                    <X size={12} />
                    <span>Cancelar</span>
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editText.trim()}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Save size={12} />
                    <span>Guardar</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed">
                {note.note_text}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonNotesSection;
