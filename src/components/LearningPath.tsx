
import { useCallback, useMemo } from 'react';
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

  // OPTIMIZADO: Memoizar función de agrupación con hash estable
  const getLessonsForModule = useCallback((moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return [];
    
    // Obtener lecciones en el orden definido por lessonIds del módulo
    return module.lessonIds
      .map(id => lessons.find(lesson => lesson.id === id))
      .filter((lesson): lesson is Lesson => lesson !== undefined);
  }, [
    // ESTABILIZADO: Hash más específico para evitar recálculos
    modules.map(m => `${m.id}:${m.lessonIds.join(',')}`).join('|'),
    lessons.map(l => l.id).join('|')
  ]);

  // OPTIMIZADO: Memoizar handler de click con dependencies más estables
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
  }, [
    // ESTABILIZADO: Solo incluir referencias estables
    Array.from(lessonStatusMap.entries()).map(([id, status]) => `${id}:${status._hash || 'no-hash'}`).join('|'),
    onSelectLesson
  ]);

  // OPTIMIZADO: Memoizar módulos ordenados
  const orderedModules = useMemo(() => {
    return modules.filter(module => {
      const moduleLessons = getLessonsForModule(module.id);
      return moduleLessons.length > 0;
    });
  }, [modules, getLessonsForModule]);
  
  return (
    <div className="py-3">
      <h2 className="text-2xl font-bold mb-2 text-center">Tu Ruta de Aprendizaje</h2>
      
      <div className="relative max-w-[400px] mx-auto">
        {orderedModules.map((module) => {
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
