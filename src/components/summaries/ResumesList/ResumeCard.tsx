
import React, { useState } from 'react';
import { EnrichedSummary } from '@/hooks/useAllSummaries';
import ActionButton from './ActionButton';
import ViewSummaryModal from '../ViewSummaryModal';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';
import { Eye, Edit, Trash2, Lightbulb, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ResumeCardProps {
  resume: EnrichedSummary;
  onDelete: (summaryId: string) => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onDelete }) => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleViewComplete = () => {
    setShowViewModal(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    onDelete(resume.id);
    setIsDeleteModalOpen(false);
  };

  const formatCreatedAt = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: es 
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <>
      <div className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
        {/* Course Info */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {resume.course_title}
          </h3>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="px-3 py-1 bg-gradient-to-r from-miyo-600 to-miyo-700 text-white text-xs font-medium rounded-full">
              {resume.category_name}
            </span>
            <span className="text-xs text-gray-500">
              Creado {formatCreatedAt(resume.created_at)}
            </span>
          </div>
        </div>
        
        {/* Insight Preview */}
        {resume.insight_preview && (
          <div className="text-gray-600 text-sm leading-relaxed mb-4 italic">
            "{resume.insight_preview}"
          </div>
        )}
        
        {/* Stats */}
        <div className="flex items-center gap-6 mb-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lightbulb className="h-4 w-4" />
            <span>{resume.key_concepts_count} conceptos clave</span>
          </div>
          
          {resume.total_actions > 0 && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4" />
              <span>{resume.completed_actions}/{resume.total_actions} planes completados</span>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                  style={{ width: `${resume.total_actions > 0 ? (resume.completed_actions / resume.total_actions) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <ActionButton 
            variant="primary" 
            onClick={handleViewComplete}
            icon={Eye}
          >
            Ver Completo
          </ActionButton>
          <ActionButton 
            variant="secondary" 
            onClick={handleViewComplete}
            icon={Edit}
          >
            Editar
          </ActionButton>
          <ActionButton 
            variant="danger" 
            onClick={handleDeleteClick}
            icon={Trash2}
          >
            Eliminar
          </ActionButton>
        </div>
      </div>

      {showViewModal && (
        <ViewSummaryModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          summary={resume}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar resumen?"
        description="Esta acción no se puede deshacer. El resumen será eliminado permanentemente."
        confirmText="Confirmar eliminación"
        cancelText="Cancelar"
      />
    </>
  );
};

export default ResumeCard;
