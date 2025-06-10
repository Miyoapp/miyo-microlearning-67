
import React from 'react';
import { Module, Lesson } from '@/types';
import LessonItem from './LessonItem';

interface ModuleSectionProps {
  module: Module;
  moduleLessons: Lesson[];
  lessonStatusMap: Map<string, any>;
  getLessonClasses: Map<string, any>;
  onLessonClick: (lesson: Lesson) => void;
}

const ModuleSection = React.memo(({ 
  module, 
  moduleLessons, 
  lessonStatusMap, 
  getLessonClasses, 
  onLessonClick 
}: ModuleSectionProps) => {
  if (moduleLessons.length === 0) return null;
  
  return (
    <div className="mb-6">
      {/* Título del módulo */}
      <div className="text-center mb-3 px-2">
        <h3 className="text-sm font-medium text-indigo-700 bg-indigo-50 inline-block py-1 px-3 rounded-full">
          {module.title}
        </h3>
      </div>
      
      {/* Lecciones dentro de este módulo */}
      <div className="space-y-[25px]">
        {moduleLessons.map((lesson, index) => {
          const status = lessonStatusMap.get(lesson.id);
          if (!status) return null;
          
          const classes = getLessonClasses.get(lesson.id);
          if (!classes) return null;
          
          return (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              index={index}
              status={status}
              classes={classes}
              onLessonClick={onLessonClick}
            />
          );
        })}
      </div>
    </div>
  );
});

ModuleSection.displayName = 'ModuleSection';

export default ModuleSection;
