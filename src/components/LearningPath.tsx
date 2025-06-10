
import { useCallback } from 'react';
import { Lesson, Module } from '../types';
import React from 'react';
import { useLessonStatus } from '@/hooks/learning-path/useLessonStatus';
import { useLessonClasses } from '@/hooks/learning-path/useLessonClasses';
import ModuleSection from './learning-path/ModuleSection';

interface LearningPathProps {
  lessons: Lesson[];
  modules: Module[];
  onSelectLesson: (lesson: Lesson) => void;
  currentLessonId: string | null;
}

const LearningPath = React.memo(({ lessons, modules, onSelectLesson, currentLessonId }: LearningPathProps) => {
  // Use custom hooks for status and classes
  const lessonStatusMap = useLessonStatus(lessons, modules, currentLessonId);
  const getLessonClasses = useLessonClasses(lessons, lessonStatusMap);

  // Agrupar lecciones por módulo manteniendo el orden real
  const getLessonsForModule = useCallback((moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return [];
    
    // Obtener lecciones en el orden definido por lessonIds del módulo
    return module.lessonIds
      .map(id => lessons.find(lesson => lesson.id === id))
      .filter((lesson): lesson is Lesson => lesson !== undefined);
  }, [modules, lessons]);

  // OPTIMIZADO: Memoizar handler de click
  const handleLessonClick = useCallback((lesson: Lesson) => {
    const status = lessonStatusMap.get(lesson.id);
    if (!status) return;
    
    const { canPlay, isCompleted, isLocked, isFirstInSequence } = status;
    
    if (canPlay) {
      console.log('🎯 User clicked lesson:', lesson.title, 'canPlay:', canPlay, 'isCompleted:', isCompleted, 'isLocked:', isLocked, 'isFirst:', isFirstInSequence);
      onSelectLesson(lesson);
    } else {
      console.log('🚫 Lesson not playable:', lesson.title, 'isLocked:', isLocked, 'isFirst:', isFirstInSequence);
    }
  }, [lessonStatusMap, onSelectLesson]);
  
  return (
    <div className="py-3">
      <h2 className="text-2xl font-bold mb-2 text-center">Tu Ruta de Aprendizaje</h2>
      
      <div className="relative max-w-[400px] mx-auto">
        {modules.map((module) => {
          const moduleLessons = getLessonsForModule(module.id);
          
          return (
            <ModuleSection
              key={module.id}
              module={module}
              moduleLessons={moduleLessons}
              lessonStatusMap={lessonStatusMap}
              getLessonClasses={getLessonClasses}
              onLessonClick={handleLessonClick}
            />
          );
        })}
      </div>
    </div>
  );
});

LearningPath.displayName = 'LearningPath';

export default LearningPath;
