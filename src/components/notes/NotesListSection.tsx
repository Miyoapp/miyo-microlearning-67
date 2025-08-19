
import React, { useEffect } from 'react';
import { LessonNote } from '@/types/notes';
import { Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotesListSectionProps {
  notes: LessonNote[];
  onDeleteNote: (noteId: string) => void;
  onEditNote: (noteId: string, noteText: string) => void;
  onSeekToTime?: (timeInSeconds: number) => void;
}

const NotesListSection: React.FC<NotesListSectionProps> = ({
  notes,
  onDeleteNote,
  onEditNote,
  onSeekToTime
}) => {
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (notes.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center text-gray-500">
        <Clock size={24} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">Aún no tienes notas en esta lección</p>
        <p className="text-xs mt-1">Haz clic en el ícono de nota mientras escuchas para agregar una</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Clock size={16} />
        Mis Notas ({notes.length})
      </h4>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <button
                onClick={() => onSeekToTime?.(note.timestamp_seconds)}
                className="flex items-center gap-1 text-xs text-[#5e16ea] hover:underline font-medium"
              >
                <Clock size={12} />
                {formatTime(note.timestamp_seconds)}
              </button>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    const newText = prompt('Editar nota:', note.note_text);
                    if (newText && newText !== note.note_text) {
                      onEditNote(note.id, newText);
                    }
                  }}
                >
                  <Edit size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  onClick={() => {
                    if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
                      onDeleteNote(note.id);
                    }
                  }}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 leading-relaxed">{note.note_text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesListSection;
