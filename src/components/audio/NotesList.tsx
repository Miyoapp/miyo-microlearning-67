
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AudioNote } from '@/hooks/useAudioNotes';
import { Play, Edit2, Trash2, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface NotesListProps {
  isOpen: boolean;
  onClose: () => void;
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

const NotesList: React.FC<NotesListProps> = ({
  isOpen,
  onClose,
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Mis Notas ({notes.length})
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aún no tienes notas para esta lección.</p>
              <p className="text-sm">Agrega una nota durante la reproducción.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onJumpToTime(note.timestamp_seconds)}
                        className="flex items-center space-x-1"
                      >
                        <Play className="h-3 w-3" />
                        <span>{formatTime(note.timestamp_seconds)}</span>
                      </Button>
                      <span className="text-xs text-gray-500">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(note)}
                        disabled={editingNoteId !== null}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteNote(note.id)}
                        disabled={editingNoteId !== null}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={!editText.trim()}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Guardar
                        </Button>
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
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NotesList;
