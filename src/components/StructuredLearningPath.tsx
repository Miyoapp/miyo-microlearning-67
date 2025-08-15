
import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
  // Estado local para el podcast que se puede actualizar
  const [podcast, setPodcast] = useState<Podcast>(() => ({
    id: courseId,
    lessons,
    modules
  } as Podcast));

  // CRÍTICO: Sincronizar podcast local con props actualizados
  useEffect(() => {
    console.log('🔄 StructuredLearningPath: Syncing with external lesson updates');
    setPodcast({
      id: courseId,
      lessons,
      modules
    } as Podcast);
  }, [courseId, lessons, modules]);

  const {
    currentLesson,
    isPlaying,
    handleSelectLesson,
    handleLessonComplete,
    handleProgressUpdate: originalHandleProgressUpdate,
    handleTogglePlay,
    updatedPodcast
  } = useConsolidatedLessons(podcast, setPodcast);

  // MEJORADO: Lógica de sincronización más robusta
  const currentPodcast = useMemo(() => {
    // Priorizar updatedPodcast si existe, pero mantener sincronización con props
    if (updatedPodcast) {
      console.log('📦 Using updatedPodcast from consolidated lessons');
      return updatedPodcast;
    }
    console.log('📦 Using local podcast state');
    return podcast;
  }, [updatedPodcast, podcast]);

  const currentLessons = currentPodcast.lessons;
  const currentModules = currentPodcast.modules;

  console.log('🔄 StructuredLearningPath - Estado actualizado:', {
    originalLessonsCount: lessons.length,
    updatedLessonsCount: currentLessons.length,
    hasUpdatedPodcast: !!updatedPodcast,
    currentLessonTitle: currentLesson?.title,
    isPlaying,
    completedLessons: currentLessons.filter(l => l.isCompleted).length,
    unlockedLessons: currentLessons.filter(l => !l.isLocked).length,
    visualState: 'MAINTAINING_COMPLETED_LESSONS_AS_PLAYABLE'
  });

  // ACTUALIZADO: Usar las lecciones actualizadas para el cálculo de estado
  const lessonStatusMap = useLessonStatus(currentLessons, currentModules, currentLesson?.id || null);
  
  // DEBUG: Validar que lecciones completadas no están bloqueadas
  useEffect(() => {
    const completedLessons = currentLessons.filter(l => l.isCompleted);
    completedLessons.forEach(lesson => {
      const status = lessonStatusMap.get(lesson.id);
      if (status?.isLocked) {
        console.error('🚨 VISUAL LOCK BUG DETECTED:', {
          lessonTitle: lesson.title,
          isCompleted: lesson.isCompleted,
          statusIsLocked: status.isLocked,
          statusCanPlay: status.canPlay
        });
      }
    });
  }, [currentLessons, lessonStatusMap]);
  
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
    handleTogglePlay();
  }, [handleTogglePlay]);

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
