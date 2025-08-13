
import React, { useCallback, useMemo } from 'react';
import { Lesson, Module } from '@/types';
import { useLessonStatus } from '@/hooks/learning-path/useLessonStatus';
import { useStructuredLessons } from '@/hooks/useStructuredLessons';
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
  } as any), [courseId, lessons, modules]);

  const lessonStatusMap = useLessonStatus(lessons, modules, currentLessonId || null);
  
  const {
    currentLessonId: activeLessonId,
    handlePlay,
    handlePause,
    handleComplete,
    handleProgressUpdate
  } = useStructuredLessons(podcast);

  const getLessonsForModule = useCallback((moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return [];
    
    return module.lessonIds
      .map(id => lessons.find(lesson => lesson.id === id))
      .filter((lesson): lesson is Lesson => lesson !== undefined);
  }, [modules, lessons]);

  const orderedModules = useMemo(() => {
    return modules.filter(module => {
      const moduleLessons = getLessonsForModule(module.id);
      return moduleLessons.length > 0;
    });
  }, [modules, getLessonsForModule]);

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
              currentLessonId={activeLessonId}
              lessonStatusMap={lessonStatusMap}
              onPlay={handlePlay}
              onPause={handlePause}
              onComplete={handleComplete}
              onProgressUpdate={handleProgressUpdate}
            />
          );
        })}
      </div>
    </div>
  );
};

export default StructuredLearningPath;
