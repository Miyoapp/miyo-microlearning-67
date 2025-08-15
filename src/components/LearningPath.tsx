
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
  onLessonComplete: (lessonId: string) => void;
  onProgressUpdate: (lessonId: string, position: number) => void;
  currentLessonId: string | null;
}

const LearningPath = React.memo(({ 
  lessons, 
  modules, 
  onSelectLesson, 
  onLessonComplete,
  onProgressUpdate,
  currentLessonId 
}: LearningPathProps) => {
  const lessonStatusMap = useLessonStatus(lessons, modules, currentLessonId);
  const getLessonClasses = useLessonClasses(lessons, lessonStatusMap);

  const getLessonsForModule = useCallback((moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return [];
    
    return module.lessonIds
      .map(id => lessons.find(lesson => lesson.id === id))
      .filter((lesson): lesson is Lesson => lesson !== undefined);
  }, [
    modules.map(m => `${m.id}:${m.lessonIds.join(',')}`).join('|'),
    lessons.map(l => l.id).join('|')
  ]);

  const handleLessonClick = useCallback((lesson: Lesson) => {
    console.log('🎯 LEARNING PATH - CLICK RECIBIDO:', {
      lessonTitle: lesson.title,
      timestamp: new Date().toLocaleTimeString()
    });
    
    const status = lessonStatusMap.get(lesson.id);
    if (!status) return;
    
    const { canPlay } = status;
    
    if (canPlay) {
      console.log('✅ LEARNING PATH - ENVIANDO A onSelectLesson:', lesson.title);
      onSelectLesson(lesson);
    }
  }, [
    Array.from(lessonStatusMap.entries()).map(([id, status]) => `${id}:${status._hash || 'no-hash'}`).join('|'),
    onSelectLesson
  ]);

  const orderedModules = useMemo(() => {
    return modules.filter(module => {
      const moduleLessons = getLessonsForModule(module.id);
      return moduleLessons.length > 0;
    });
  }, [modules, getLessonsForModule]);
  
  return (
    <div className="py-3">
      <h2 className="text-2xl font-bold mb-6 text-center">Tu Ruta de Aprendizaje</h2>
      
      <div className="relative max-w-2xl mx-auto">
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
              onLessonComplete={onLessonComplete}
              onProgressUpdate={onProgressUpdate}
            />
          );
        })}
      </div>
    </div>
  );
});

LearningPath.displayName = 'LearningPath';

export default LearningPath;
