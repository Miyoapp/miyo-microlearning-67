
import React, { useCallback, useMemo } from 'react';
import { Lesson, Module, Podcast } from '@/types';
import { useLessonStatus } from '@/hooks/learning-path/useLessonStatus';
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';
import StructuredModuleSection from './learning-path/StructuredModuleSection';

interface StructuredLearningPathProps {
  lessons: Lesson[];
  modules: Module[];
  courseId: string;
  currentLessonId?: string | null;
}

const StructuredLearningPath: React.FC<StructuredLearningPathProps> = ({
  lessons,
  modules,
  courseId,
  currentLessonId
}) => {
  const podcast = useMemo(() => ({
    id: courseId,
    lessons,
    modules
  } as Podcast), [courseId, lessons, modules]);

  // Use the consolidated lessons system with all the original logic
  const {
    currentLesson,
    isPlaying,
    handleSelectLesson,
    handleLessonComplete,
    handleProgressUpdate: originalHandleProgressUpdate,
    updatedPodcast // NUEVO: Usar el podcast actualizado
  } = useConsolidatedLessons(podcast, () => {});

  // CRÍTICO: Usar las lecciones actualizadas del sistema consolidado en lugar de las props
  const currentLessons = updatedPodcast?.lessons || lessons;
  const currentModules = updatedPodcast?.modules || modules;

  console.log('🔄 StructuredLearningPath - Using updated lessons:', {
    originalLessonsCount: lessons.length,
    updatedLessonsCount: currentLessons.length,
    hasUpdatedPodcast: !!updatedPodcast,
    updatedLessonsPreview: currentLessons.slice(0, 2).map(l => ({
      title: l.title,
      isCompleted: l.isCompleted ? '🏆' : '❌',
      isLocked: l.isLocked ? '🔒' : '🔓'
    }))
  });

  // ACTUALIZADO: Usar las lecciones actualizadas para el cálculo de estado
  const lessonStatusMap = useLessonStatus(currentLessons, currentModules, currentLesson?.id || null);
  
  const getLessonsForModule = useCallback((moduleId: string) => {
    const module = currentModules.find(m => m.id === moduleId);
    if (!module) return [];
    
    return module.lessonIds
      .map(id => currentLessons.find(lesson => lesson.id === id))
      .filter((lesson): lesson is Lesson => lesson !== undefined);
  }, [currentModules, currentLessons]);

  const orderedModules = useMemo(() => {
    return currentModules.filter(module => {
      const moduleLessons = getLessonsForModule(module.id);
      return moduleLessons.length > 0;
    });
  }, [currentModules, getLessonsForModule]);

  const handlePlay = useCallback((lesson: Lesson) => {
    console.log('🎵 StructuredLearningPath: Play lesson:', lesson.title);
    handleSelectLesson(lesson, true); // Force auto-play
  }, [handleSelectLesson]);

  const handlePause = useCallback(() => {
    console.log('⏸️ StructuredLearningPath: Pause lesson');
    // The pause logic is handled internally by useConsolidatedLessons
  }, []);

  // Create wrapper function that matches the expected signature
  const handleProgressUpdate = useCallback((lesson: Lesson, progress: number) => {
    // Call the original function with just the progress value
    originalHandleProgressUpdate(progress);
  }, [originalHandleProgressUpdate]);

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
        Tu Ruta de Aprendizaje
      </h2>
      
      <div className="max-w-2xl mx-auto space-y-8">
        {orderedModules.map((module) => {
          const moduleLessons = getLessonsForModule(module.id);
          
          return (
            <StructuredModuleSection
              key={module.id}
              module={module}
              moduleLessons={moduleLessons}
              courseId={courseId}
              currentLessonId={currentLesson?.id || null}
              isPlaying={isPlaying}
              lessonStatusMap={lessonStatusMap}
              onPlay={handlePlay}
              onPause={handlePause}
              onComplete={handleLessonComplete}
              onProgressUpdate={handleProgressUpdate}
            />
          );
        })}
      </div>
    </div>
  );
};

export default StructuredLearningPath;
