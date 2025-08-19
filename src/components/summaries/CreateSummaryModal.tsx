
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, FileText } from 'lucide-react';

interface CreateSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string) => void;
  courseTitle: string;
}

const CreateSummaryModal: React.FC<CreateSummaryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  courseTitle
}) => {
  const [title, setTitle] = useState(`Resumen de ${courseTitle}`);
  const [keyConcepts, setKeyConcepts] = useState('');
  const [personalInsights, setPersonalInsights] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || (!keyConcepts.trim() && !personalInsights.trim() && !actionItems.trim())) {
      return;
    }
    
    setSaving(true);
    
    // Crear contenido estructurado
    const content = `
**Conceptos Clave:**
${keyConcepts.trim()}

**Insights Personales:**
${personalInsights.trim()}

**Acciones a Tomar:**
${actionItems.trim()}
    `.trim();
    
    await onSave(title.trim(), content);
    setSaving(false);
    handleClose();
  };

  const handleClose = () => {
    setTitle(`Resumen de ${courseTitle}`);
    setKeyConcepts('');
    setPersonalInsights('');
    setActionItems('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#5e16ea]" />
            Crear Resumen Personalizado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título del Resumen</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de tu resumen"
            />
          </div>
          
          {/* Key Concepts */}
          <div className="space-y-2">
            <Label htmlFor="concepts">Conceptos Clave</Label>
            <Textarea
              id="concepts"
              value={keyConcepts}
              onChange={(e) => setKeyConcepts(e.target.value)}
              placeholder="¿Cuáles fueron los conceptos más importantes que aprendiste?"
              className="min-h-[100px] resize-none"
            />
          </div>
          
          {/* Personal Insights */}
          <div className="space-y-2">
            <Label htmlFor="insights">Insights Personales</Label>
            <Textarea
              id="insights"
              value={personalInsights}
              onChange={(e) => setPersonalInsights(e.target.value)}
              placeholder="¿Qué reflexiones o ideas nuevas surgieron durante el curso?"
              className="min-h-[100px] resize-none"
            />
          </div>
          
          {/* Action Items */}
          <div className="space-y-2">
            <Label htmlFor="actions">Acciones a Tomar</Label>
            <Textarea
              id="actions"
              value={actionItems}
              onChange={(e) => setActionItems(e.target.value)}
              placeholder="¿Qué pasos específicos planeas tomar basándote en lo aprendido?"
              className="min-h-[100px] resize-none"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={saving}
            >
              <FileText size={16} className="mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || (!keyConcepts.trim() && !personalInsights.trim() && !actionItems.trim()) || saving}
              className="bg-[#5e16ea] hover:bg-[#4a11ba]"
            >
              <Sparkles size={16} className="mr-2" />
              {saving ? 'Guardando...' : 'Guardar Resumen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSummaryModal;
