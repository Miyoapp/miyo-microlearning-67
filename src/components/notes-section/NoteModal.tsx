
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EnrichedNote } from '@/types/notes';
import TagSelector from './TagSelector';
import { Heart } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note?: EnrichedNote | null;
  onSave: (noteId: string, updates: Partial<EnrichedNote>) => void;
  onCreate?: (noteData: { note_title: string; note_text: string; tags: string[]; is_favorite: boolean }) => void;
  mode: 'edit' | 'create';
}

const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  note,
  onSave,
  onCreate,
  mode
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (note && mode === 'edit') {
      setTitle(note.note_title || '');
      setContent(note.note_text);
      setSelectedTags(note.tags || []);
      setIsFavorite(note.is_favorite || false);
    } else if (mode === 'create') {
      setTitle('');
      setContent('');
      setSelectedTags([]);
      setIsFavorite(false);
    }
  }, [note, mode, isOpen]);

  const handleSave = () => {
    if (mode === 'edit' && note) {
      onSave(note.id, {
        note_title: title.trim() || undefined,
        note_text: content.trim(),
        tags: selectedTags,
        is_favorite: isFavorite
      });
    } else if (mode === 'create' && onCreate) {
      onCreate({
        note_title: title.trim(),
        note_text: content.trim(),
        tags: selectedTags,
        is_favorite: isFavorite
      });
    }
    onClose();
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const isContentValid = content.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'edit' ? '✏️ Editar Nota' : '📝 Nueva Nota'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Modifica el contenido, etiquetas y configuración de tu nota'
              : 'Crea una nueva nota independiente'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              placeholder="Escribe un título para tu nota..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Contenido */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenido *</Label>
            <Textarea
              id="content"
              placeholder="¿Qué quieres recordar?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Etiquetas */}
          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <TagSelector
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
            />
          </div>

          {/* Favorita */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </Button>
            <Label className="cursor-pointer" onClick={() => setIsFavorite(!isFavorite)}>
              Marcar como favorita
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!isContentValid}
            className="bg-[#7c3aed] hover:bg-[#6d28d9]"
          >
            {mode === 'edit' ? 'Guardar Cambios' : 'Crear Nota'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteModal;
