
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Edit3, Check, X as XIcon } from 'lucide-react';
import { CourseSummary } from '@/types/notes';

interface ViewSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: CourseSummary | null;
  onUpdateSummary?: (summaryId: string, updates: { key_concepts?: string; personal_insight?: string }) => Promise<void>;
}

const ViewSummaryModal: React.FC<ViewSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  onUpdateSummary
}) => {
  const [editingConcepts, setEditingConcepts] = useState(false);
  const [editingInsight, setEditingInsight] = useState(false);
  const [conceptsValue, setConceptsValue] = useState('');
  const [insightValue, setInsightValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!summary) return null;

  const handleEditConcepts = () => {
    setConceptsValue(summary.key_concepts || '');
    setEditingConcepts(true);
  };

  const handleEditInsight = () => {
    setInsightValue(summary.personal_insight || '');
    setEditingInsight(true);
  };

  const handleSaveConcepts = async () => {
    if (!onUpdateSummary || !summary) return;
    
    setIsUpdating(true);
    try {
      await onUpdateSummary(summary.id, { key_concepts: conceptsValue });
      setEditingConcepts(false);
      // Update local summary object
      summary.key_concepts = conceptsValue;
    } catch (error) {
      console.error('Error updating concepts:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveInsight = async () => {
    if (!onUpdateSummary || !summary) return;
    
    setIsUpdating(true);
    try {
      await onUpdateSummary(summary.id, { personal_insight: insightValue });
      setEditingInsight(false);
      // Update local summary object
      summary.personal_insight = insightValue;
    } catch (error) {
      console.error('Error updating insight:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = (type: 'concepts' | 'insight') => {
    if (type === 'concepts') {
      setEditingConcepts(false);
      setConceptsValue('');
    } else {
      setEditingInsight(false);
      setInsightValue('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            {summary.title}
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Concepts Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Conceptos clave que aprendí
              </h3>
              {!editingConcepts && onUpdateSummary && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditConcepts}
                  className="p-2 h-8 w-8"
                >
                  <Edit3 size={14} />
                </Button>
              )}
            </div>
            
            {editingConcepts ? (
              <div className="space-y-3">
                <Textarea
                  value={conceptsValue}
                  onChange={(e) => setConceptsValue(e.target.value)}
                  className="min-h-[100px] resize-none"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelEdit('concepts')}
                    disabled={isUpdating}
                  >
                    <XIcon size={14} className="mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveConcepts}
                    disabled={isUpdating}
                    className="bg-[#5e16ea] hover:bg-[#4a11ba]"
                  >
                    <Check size={14} className="mr-1" />
                    {isUpdating ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {summary.key_concepts || 'No hay conceptos clave registrados.'}
                </p>
              </div>
            )}
          </div>

          {/* Personal Insight Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Mi gran insight personal
              </h3>
              {!editingInsight && onUpdateSummary && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditInsight}
                  className="p-2 h-8 w-8"
                >
                  <Edit3 size={14} />
                </Button>
              )}
            </div>
            
            {editingInsight ? (
              <div className="space-y-3">
                <Textarea
                  value={insightValue}
                  onChange={(e) => setInsightValue(e.target.value)}
                  className="min-h-[100px] resize-none"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelEdit('insight')}
                    disabled={isUpdating}
                  >
                    <XIcon size={14} className="mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveInsight}
                    disabled={isUpdating}
                    className="bg-[#5e16ea] hover:bg-[#4a11ba]"
                  >
                    <Check size={14} className="mr-1" />
                    {isUpdating ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {summary.personal_insight || 'No hay insight personal registrado.'}
                </p>
              </div>
            )}
          </div>

          {/* Action Plans Section (if exists) */}
          {summary.summary_content && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Contenido del Resumen
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {summary.summary_content}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSummaryModal;
