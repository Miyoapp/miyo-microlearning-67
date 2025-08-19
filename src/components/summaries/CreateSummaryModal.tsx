
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Key, Lightbulb, Target, Link } from 'lucide-react';

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
  const [title, setTitle] = useState(`Mi Resumen Personal - ${courseTitle}`);
  const [keyConcepts, setKeyConcepts] = useState('');
  const [personalInsight, setPersonalInsight] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [connections, setConnections] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || (!keyConcepts.trim() && !personalInsight.trim() && !actionPlan.trim())) {
      return;
    }
    
    setSaving(true);
    
    // Crear contenido estructurado con las 4 secciones
    const content = `
**🔑 Conceptos clave que aprendí:**
${keyConcepts.trim()}

**💡 Mi gran insight personal:**
${personalInsight.trim()}

**🎯 Cómo lo aplicaré en mi vida:**
${actionPlan.trim()}

${connections.trim() ? `**🔗 Conexiones que descubrí:**
${connections.trim()}` : ''}
    `.trim();
    
    await onSave(title.trim(), content);
    setSaving(false);
    handleClose();
  };

  const handleClose = () => {
    setTitle(`Mi Resumen Personal - ${courseTitle}`);
    setKeyConcepts('');
    setPersonalInsight('');
    setActionPlan('');
    setConnections('');
    onClose();
  };

  const isFormValid = title.trim() && (keyConcepts.trim() || personalInsight.trim() || actionPlan.trim());

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
            <Sparkles size={24} className="text-[#5e16ea]" />
            📝 Tu Resumen Personal
          </DialogTitle>
          <p className="text-gray-600 mt-2">Reflexiona sobre todo lo aprendido en esta ruta</p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Título del Resumen</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de tu resumen"
              className="border-2 focus:ring-2 focus:ring-[#5e16ea] focus:border-[#5e16ea]"
            />
          </div>
          
          {/* Key Concepts */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Key size={20} className="text-[#5e16ea] mt-1" />
              <div className="flex-1">
                <Label htmlFor="concepts" className="text-base font-semibold text-gray-800">
                  Conceptos clave que aprendí
                </Label>
                <p className="text-xs text-gray-500 italic mt-1">
                  Los insights más importantes de toda la ruta
                </p>
              </div>
            </div>
            <Textarea
              id="concepts"
              value={keyConcepts}
              onChange={(e) => setKeyConcepts(e.target.value)}
              placeholder="¿Cuáles fueron los 3-5 conceptos más importantes que descubriste? Ejemplo: 'La marca personal debe nacer de la autenticidad, no de la imagen externa...'"
              className="min-h-[100px] resize-none border-2 focus:ring-2 focus:ring-[#5e16ea] focus:border-[#5e16ea]"
            />
          </div>
          
          {/* Personal Insight */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Lightbulb size={20} className="text-[#5e16ea] mt-1" />
              <div className="flex-1">
                <Label htmlFor="insights" className="text-base font-semibold text-gray-800">
                  Mi gran insight personal
                </Label>
                <p className="text-xs text-gray-500 italic mt-1">
                  El momento "ajá" más significativo
                </p>
              </div>
            </div>
            <Textarea
              id="insights"
              value={personalInsight}
              onChange={(e) => setPersonalInsight(e.target.value)}
              placeholder="¿Qué fue lo que más te sorprendió o cambió tu perspectiva? Describe ese momento de claridad..."
              className="min-h-[100px] resize-none border-2 focus:ring-2 focus:ring-[#5e16ea] focus:border-[#5e16ea]"
            />
          </div>
          
          {/* Action Plan */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Target size={20} className="text-[#5e16ea] mt-1" />
              <div className="flex-1">
                <Label htmlFor="actions" className="text-base font-semibold text-gray-800">
                  Cómo lo aplicaré en mi vida
                </Label>
                <p className="text-xs text-gray-500 italic mt-1">
                  Acciones concretas que tomarás
                </p>
              </div>
            </div>
            <Textarea
              id="actions"
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              placeholder="¿Qué cambios específicos harás? ¿Qué pasos darás en los próximos 30 días?"
              className="min-h-[100px] resize-none border-2 focus:ring-2 focus:ring-[#5e16ea] focus:border-[#5e16ea]"
            />
          </div>

          {/* Connections (Optional) */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Link size={20} className="text-[#5e16ea] mt-1" />
              <div className="flex-1">
                <Label htmlFor="connections" className="text-base font-semibold text-gray-800">
                  Conexiones que descubrí
                </Label>
                <p className="text-xs text-gray-500 italic mt-1">
                  Cómo se relacionan los diferentes temas
                </p>
              </div>
            </div>
            <Textarea
              id="connections"
              value={connections}
              onChange={(e) => setConnections(e.target.value)}
              placeholder="¿Cómo se conectan los temas del curso? ¿Qué patrones identificaste entre las diferentes lecciones?"
              className="min-h-[100px] resize-none border-2 focus:ring-2 focus:ring-[#5e16ea] focus:border-[#5e16ea]"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-center pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={saving}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isFormValid || saving}
              className="bg-[#5e16ea] hover:bg-[#4a11ba] px-8"
            >
              <Sparkles size={16} className="mr-2" />
              {saving ? 'Guardando...' : '💾 Guardar mi resumen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSummaryModal;
