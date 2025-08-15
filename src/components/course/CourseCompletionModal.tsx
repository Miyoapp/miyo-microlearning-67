
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Sparkles, FileText, X } from 'lucide-react';
import { useCourseSummary } from '@/hooks/useCourseSummary';

interface CourseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseId: string;
}

const CourseCompletionModal: React.FC<CourseCompletionModalProps> = ({
  isOpen,
  onClose,
  courseTitle,
  courseId
}) => {
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [summaryTitle, setSummaryTitle] = useState('');
  const [summaryContent, setSummaryContent] = useState('');
  
  const { createSummary, loading } = useCourseSummary(courseId);

  const handleCreateSummary = () => {
    setShowSummaryForm(true);
    setSummaryTitle(`Resumen de ${courseTitle}`);
  };

  const handleSaveSummary = async () => {
    if (summaryTitle.trim() && summaryContent.trim()) {
      const result = await createSummary(summaryTitle.trim(), summaryContent.trim());
      if (result) {
        setSummaryTitle('');
        setSummaryContent('');
        setShowSummaryForm(false);
        onClose();
      }
    }
  };

  const handleClose = () => {
    setSummaryTitle('');
    setSummaryContent('');
    setShowSummaryForm(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {!showSummaryForm ? (
          // Pantalla de felicitaciones
          <div className="text-center space-y-6 py-6">
            <div className="flex justify-center">
              <div className="relative">
                <Trophy className="h-20 w-20 text-yellow-500" />
                <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                ¡Felicitaciones!
              </h2>
              <p className="text-gray-600">
                Has completado exitosamente el curso
              </p>
              <p className="text-lg font-semibold text-indigo-600">
                "{courseTitle}"
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleCreateSummary}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
              >
                <FileText className="h-5 w-5 mr-2" />
                Crear Resumen Personalizado
              </Button>
              
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Continuar sin Resumen
              </Button>
            </div>
          </div>
        ) : (
          // Formulario de resumen
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Crear Resumen Personalizado
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Resumen
                </label>
                <Input
                  value={summaryTitle}
                  onChange={(e) => setSummaryTitle(e.target.value)}
                  placeholder="Ej: Resumen de Introducción a la IA"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido del Resumen
                </label>
                <Textarea
                  value={summaryContent}
                  onChange={(e) => setSummaryContent(e.target.value)}
                  placeholder="Escribe aquí tu resumen personalizado del curso. Incluye los puntos más importantes, conceptos clave y aprendizajes principales..."
                  className="w-full min-h-[200px] resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowSummaryForm(false)}
                disabled={loading}
              >
                Volver
              </Button>
              <Button
                onClick={handleSaveSummary}
                disabled={!summaryTitle.trim() || !summaryContent.trim() || loading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? 'Guardando...' : 'Guardar Resumen'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CourseCompletionModal;
