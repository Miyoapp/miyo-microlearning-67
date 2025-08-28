
import React from 'react';
import { Module, Lesson } from '@/types';
import { UserLessonProgress } from '@/hooks/useUserLessonProgress';
import LessonCard from './LessonCard';

interface ModuleSectionProps {
  module: Module;
  moduleLessons: Lesson[];
  lessonStatusMap: Map<string, any>;
  getLessonClasses: Map<string, any>;
  currentLessonId: string | null;
  isGloballyPlaying: boolean;
  courseId: string | null;
  lessonProgress: UserLessonProgress[];
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
}

const ModuleSection = React.memo(({ 
  module, 
  moduleLessons, 
  lessonStatusMap, 
  getLessonClasses, 
  currentLessonId,
  isGloballyPlaying,
  courseId,
  lessonProgress,
  onLessonClick,
  onProgressUpdate,
  onLessonComplete
}: ModuleSectionProps) => {
  console.log('🔍 ModuleSection: Render iniciado con props:', {
    moduleTitle: module?.title,
    moduleId: module?.id,
    moduleLessonsCount: moduleLessons?.length || 0,
    currentLessonId,
    isGloballyPlaying,
    courseId,
    lessonProgressCount: lessonProgress?.length || 0,
    timestamp: new Date().toISOString()
  });

  // Verificar que los props sean válidos
  if (!module) {
    console.error('❌ ModuleSection: module es null o undefined');
    return null;
  }

  if (!moduleLessons || !Array.isArray(moduleLessons)) {
    console.error('❌ ModuleSection: moduleLessons no es válido:', moduleLessons);
    return null;
  }

  if (moduleLessons.length === 0) {
    console.warn('⚠️ ModuleSection: moduleLessons está vacío para módulo:', module.title);
    return null;
  }

  if (!lessonStatusMap || !(lessonStatusMap instanceof Map)) {
    console.error('❌ ModuleSection: lessonStatusMap no es válido:', lessonStatusMap);
    return null;
  }
  
  console.log('🏗️ ModuleSection render:', {
    moduleTitle: module.title,
    currentLessonId,
    isGloballyPlaying,
    lessonCount: moduleLessons.length,
    courseId,
    lessonProgressCount: lessonProgress.length
  });

  console.log('✅ ModuleSection: Todos los datos válidos, renderizando contenido');
  
  return (
    <div className="mb-6 sm:mb-8">
      {/* Título del módulo */}
      <div className="text-center mb-3 sm:mb-4">
        <h3 className="text-sm font-medium text-indigo-700 bg-indigo-50 inline-block py-2 px-4 rounded-full">
          {module.title}
        </h3>
      </div>
      
      {/* Lecciones como cards */}
      <div className="space-y-3 sm:space-y-4">
        {moduleLessons.map((lesson, index) => {
          const status = lessonStatusMap.get(lesson.id);
          if (!status) {
            console.warn('⚠️ ModuleSection: No status found for lesson:', lesson.title);
            return null;
          }
          
          // Add isCurrent calculation and determine if this lesson is playing
          const isCurrent = lesson.id === currentLessonId;
          const isPlaying = isCurrent && isGloballyPlaying;
          
          // Find saved progress for this specific lesson
          const savedProgress = lessonProgress.find(p => p.lesson_id === lesson.id);
          
          const enhancedStatus = {
            ...status,
            isCurrent
          };

          console.log('🔍 ModuleSection: Renderizando lección:', {
            lessonTitle: lesson.title,
            lessonId: lesson.id,
            index,
            isCurrent,
            isPlaying,
            hasSavedProgress: !!savedProgress
          });
          
          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index}
              status={enhancedStatus}
              isPlaying={isPlaying}
              courseId={courseId}
              savedProgress={savedProgress ? {
                current_position: savedProgress.current_position || 0,
                is_completed: savedProgress.is_completed || false
              } : undefined}
              onLessonClick={onLessonClick}
              onProgressUpdate={onProgressUpdate}
              onLessonComplete={onLessonComplete}
            />
          );
        })}
      </div>
    </div>
  );
});

ModuleSection.displayName = 'ModuleSection';

export default ModuleSection;
