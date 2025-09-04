
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LessonNote, NOTE_TAGS } from '@/types/notes';
import { useNotesContext } from '@/contexts/NotesContext';
import { cn } from '@/lib/utils';

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: LessonNote;
  courseTitle: string;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  isOpen,
  onClose,
  note,
  courseTitle
}) => {
  const { updateNote } = useNotesContext();
  const [noteText, setNoteText] = useState(note.note_text);
  const [selectedTags, setSelectedTags] = useState<string[]>(note.tags || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNoteText(note.note_text);
      setSelectedTags(note.tags || []);
    }
  }, [isOpen, note]);

  const handleSave = async () => {
    if (!noteText.trim()) return;
    
    setSaving(true);
    await updateNote(note.id, {
      note_text: noteText.trim(),
      tags: selectedTags
    });
    setSaving(false);
    onClose();
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Nota</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Course and Time Info */}
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <p className="font-medium text-gray-700">{courseTitle}</p>
            <p className="text-gray-500">
              Tiempo: {formatTime(note.timestamp_seconds)} • {note.lesson_title || `Lección ${note.lesson_id.slice(-1)}`}
            </p>
          </div>
          
          {/* Note Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenido de la nota</Label>
            <Textarea
              id="content"
              placeholder="Escribe tu nota aquí..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2">
              {NOTE_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all duration-200",
                    "flex items-center gap-1",
                    selectedTags.includes(tag.id)
                      ? "border-[#5e16ea] bg-purple-50 text-purple-700 scale-105"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:scale-105"
                  )}
                >
                  <span>{tag.icon}</span>
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!noteText.trim() || saving}
              className="bg-[#5e16ea] hover:bg-[#4a11ba]"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditNoteModal;
