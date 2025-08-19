
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, BookOpen, PenTool, Sparkles } from 'lucide-react';
import { Podcast } from '@/types';
import { CourseCompletionStats } from '@/types/notes';

interface CourseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSummary: () => void;
  course: Podcast;
  stats: CourseCompletionStats;
}

const CourseCompletionModal: React.FC<CourseCompletionModalProps> = ({
  isOpen,
  onClose,
  onCreateSummary,
  course,
  stats
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleContinueExploring = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-6 py-4">
          {/* Trophy Icon */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <Trophy size={32} className="text-white" />
          </div>
          
          {/* Congratulations Text */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Felicitaciones!
            </h2>
            <p className="text-gray-600">
              Has completado exitosamente
            </p>
            <h3 className="text-lg font-semibold text-[#5e16ea] mt-1">
              {course.title}
            </h3>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <BookOpen size={16} className="text-[#5e16ea]" />
                <span className="text-sm text-gray-600">Lecciones</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {stats.completedLessons}/{stats.totalLessons}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <PenTool size={16} className="text-[#5e16ea]" />
                <span className="text-sm text-gray-600">Notas</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalNotes}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 col-span-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock size={16} className="text-[#5e16ea]" />
                <span className="text-sm text-gray-600">Duración Total</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {formatTime(course.duration * 60)}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onCreateSummary}
              className="w-full bg-[#5e16ea] hover:bg-[#4a11ba] text-white font-medium py-3"
            >
              <Sparkles size={16} className="mr-2" />
              Crear Resumen Personalizado
            </Button>
            
            <Button
              variant="outline"
              onClick={handleContinueExploring}
              className="w-full"
            >
              Continuar Explorando
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseCompletionModal;
