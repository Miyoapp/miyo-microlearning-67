
import React from 'react';
import LearningPath from '@/components/LearningPath';
import { Podcast, Lesson } from '@/types';

interface CourseLearningPathSectionProps {
  podcast: Podcast;
  currentLessonId: string | null;
  isGloballyPlaying: boolean;
  onSelectLesson: (lesson: Lesson) => void;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
}

const CourseLearningPathSection: React.FC<CourseLearningPathSectionProps> = ({
  podcast,
  currentLessonId,
  isGloballyPlaying,
  onSelectLesson,
  onProgressUpdate,
  onLessonComplete
}) => {
  console.log('🔍 CourseLearningPathSection: Render iniciado con props:', {
    podcastTitle: podcast?.title,
    currentLessonId,
    isGloballyPlaying,
    lessonsCount: podcast?.lessons?.length || 0,
    modulesCount: podcast?.modules?.length || 0,
    timestamp: new Date().toISOString()
  });

  // Verificar que el podcast sea válido
  if (!podcast) {
    console.error('❌ CourseLearningPathSection: podcast es null o undefined');
    return <div>Error: No se pudo cargar la ruta de aprendizaje</div>;
  }

  if (!podcast.lessons || !Array.isArray(podcast.lessons)) {
    console.error('❌ CourseLearningPathSection: podcast.lessons no es válido:', podcast.lessons);
    return <div>Error: Las lecciones del curso no están disponibles</div>;
  }

  if (!podcast.modules || !Array.isArray(podcast.modules)) {
    console.error('❌ CourseLearningPathSection: podcast.modules no es válido:', podcast.modules);
    return <div>Error: Los módulos del curso no están disponibles</div>;
  }

  console.log('✅ CourseLearningPathSection: Todos los datos válidos, renderizando LearningPath');

  return (
    <div id="learning-path-section" className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
      <LearningPath 
        lessons={podcast.lessons}
        modules={podcast.modules}
        onSelectLesson={onSelectLesson}
        currentLessonId={currentLessonId}
        isGloballyPlaying={isGloballyPlaying}
        onProgressUpdate={onProgressUpdate}
        onLessonComplete={onLessonComplete}
        podcast={podcast}
      />
    </div>
  );
};

export default CourseLearningPathSection;
