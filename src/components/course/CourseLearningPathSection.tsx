
import React from 'react';
import LearningPath from '@/components/LearningPath';
import { Podcast, Lesson } from '@/types';
import { BookOpen, ArrowRight } from 'lucide-react';

interface CourseLearningPathSectionProps {
  podcast: Podcast;
  currentLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
}

const CourseLearningPathSection: React.FC<CourseLearningPathSectionProps> = ({
  podcast,
  currentLessonId,
  onSelectLesson
}) => {
  // DIAGNÓSTICO: Log del estado de la sección
  console.log('🛤️ LEARNING PATH SECTION RENDER:', {
    timestamp: new Date().toISOString(),
    podcastId: podcast?.id,
    podcastTitle: podcast?.title,
    lessonsCount: podcast?.lessons?.length || 0,
    modulesCount: podcast?.modules?.length || 0,
    currentLessonId,
    hasValidContent: !!(podcast?.lessons?.length > 0)
  });

  // Asegurar que siempre hay contenido visible
  if (!podcast?.lessons || podcast.lessons.length === 0) {
    return (
      <div id="learning-path-section" className="bg-white rounded-2xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Contenido del Curso
          </h3>
          <p className="text-gray-500">
            El contenido del curso se está cargando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="learning-path-section" className="bg-white rounded-2xl shadow-sm p-6">
      {/* Header con información adicional */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Tu Ruta de Aprendizaje
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {podcast.lessons.length} lecciones organizadas en {podcast.modules?.length || 1} módulos
            </p>
          </div>
          <div className="hidden sm:flex items-center text-sm text-gray-500">
            <ArrowRight className="w-4 h-4 mr-1" />
            Sigue el orden sugerido
          </div>
        </div>
      </div>

      <LearningPath 
        lessons={podcast.lessons}
        modules={podcast.modules}
        onSelectLesson={onSelectLesson}
        currentLessonId={currentLessonId}
      />
    </div>
  );
};

export default CourseLearningPathSection;
