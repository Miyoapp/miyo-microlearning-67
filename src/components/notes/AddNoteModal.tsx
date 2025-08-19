
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Clock } from 'lucide-react';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteText: string) => void;
  currentTimeSeconds: number;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentTimeSeconds
}) => {
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!noteText.trim()) return;
    
    setSaving(true);
    await onSave(noteText.trim());
    setSaving(false);
    setNoteText('');
    onClose();
  };

  const handleClose = () => {
    setNoteText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock size={20} />
            Agregar Nota
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
            <Clock size={14} />
            <span>Tiempo: {formatTime(currentTimeSeconds)}</span>
          </div>
          
          <Textarea
            placeholder="Escribe tu nota aquí..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-[120px] resize-none"
            autoFocus
          />
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!noteText.trim() || saving}
              className="bg-[#5e16ea] hover:bg-[#4a11ba]"
            >
              {saving ? 'Guardando...' : 'Guardar Nota'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteModal;
