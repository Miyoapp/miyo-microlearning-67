
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { SummaryFormData } from '@/types/notes';

interface CreateSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SummaryFormData) => Promise<void>;
  courseTitle: string;
}

const CreateSummaryModal: React.FC<CreateSummaryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  courseTitle
}) => {
  const [formData, setFormData] = useState<SummaryFormData>({
    title: `Resumen de ${courseTitle}`,
    keyConcepts: '',
    personalInsight: '',
    actionPlans: ['']
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAddActionPlan = () => {
    setFormData(prev => ({
      ...prev,
      actionPlans: [...prev.actionPlans, '']
    }));
  };

  const handleRemoveActionPlan = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actionPlans: prev.actionPlans.filter((_, i) => i !== index)
    }));
  };

  const handleActionPlanChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      actionPlans: prev.actionPlans.map((plan, i) => i === index ? value : plan)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Filter out empty action plans
    const filteredActionPlans = formData.actionPlans.filter(plan => plan.trim() !== '');

    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        actionPlans: filteredActionPlans
      });
      
      // Reset form
      setFormData({
        title: `Resumen de ${courseTitle}`,
        keyConcepts: '',
        personalInsight: '',
        actionPlans: ['']
      });
    } catch (error) {
      console.error('Error saving summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: `Resumen de ${courseTitle}`,
      keyConcepts: '',
      personalInsight: '',
      actionPlans: ['']
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Tu Resumen Personal
          </DialogTitle>
          {/* Botón X eliminado - el DialogHeader ya incluye uno automáticamente */}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Título del Resumen
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full"
              required
            />
          </div>

          {/* Key Concepts */}
          <div className="space-y-2">
            <Label htmlFor="keyConcepts" className="text-sm font-medium">
              Conceptos clave que aprendí
            </Label>
            <Textarea
              id="keyConcepts"
              value={formData.keyConcepts}
              onChange={(e) => setFormData(prev => ({ ...prev, keyConcepts: e.target.value }))}
              placeholder="Escribe los conceptos más importantes que aprendiste en este curso..."
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          {/* Personal Insight */}
          <div className="space-y-2">
            <Label htmlFor="personalInsight" className="text-sm font-medium">
              Mi gran insight personal
            </Label>
            <Textarea
              id="personalInsight"
              value={formData.personalInsight}
              onChange={(e) => setFormData(prev => ({ ...prev, personalInsight: e.target.value }))}
              placeholder="¿Cuál fue tu mayor aprendizaje o revelación personal?"
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          {/* Action Plans */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Planes de Acción
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddActionPlan}
                className="flex items-center gap-1"
              >
                <Plus size={14} />
                Agregar
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.actionPlans.map((plan, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={plan}
                    onChange={(e) => handleActionPlanChange(index, e.target.value)}
                    placeholder={`Plan de acción ${index + 1}...`}
                    className="flex-1"
                  />
                  {formData.actionPlans.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveActionPlan(index)}
                      className="px-2"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#5e16ea] hover:bg-[#4a11ba]"
            >
              {isLoading ? 'Guardando...' : 'Guardar Resumen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSummaryModal;