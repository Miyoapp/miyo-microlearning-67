
import React from 'react';
import { Module, Lesson } from '@/types';
import LessonCard from './LessonCard';

interface ModuleSectionProps {
  module: Module;
  moduleLessons: Lesson[];
  lessonStatusMap: Map<string, any>;
  getLessonClasses: Map<string, any>;
  currentLessonId: string | null;
  isGloballyPlaying: boolean;
  courseId: string | null;
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
  onLessonClick,
  onProgressUpdate,
  onLessonComplete
}: ModuleSectionProps) => {
  if (moduleLessons.length === 0) return null;
  
  console.log('🏗️ ModuleSection render:', {
    moduleTitle: module.title,
    currentLessonId,
    isGloballyPlaying,
    lessonCount: moduleLessons.length,
    courseId
  });
  
  return (
    <div className="mb-8">
      {/* Título del módulo */}
      <div className="text-center mb-4">
        <h3 className="text-sm font-medium text-indigo-700 bg-indigo-50 inline-block py-2 px-4 rounded-full">
          {module.title}
        </h3>
      </div>
      
      {/* Lecciones como cards */}
      <div className="space-y-4">
        {moduleLessons.map((lesson, index) => {
          const status = lessonStatusMap.get(lesson.id);
          if (!status) return null;
          
          // Add isCurrent calculation and determine if this lesson is playing
          const isCurrent = lesson.id === currentLessonId;
          const isPlaying = isCurrent && isGloballyPlaying;
          
          const enhancedStatus = {
            ...status,
            isCurrent
          };
          
          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index}
              status={enhancedStatus}
              isPlaying={isPlaying}
              courseId={courseId}
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
