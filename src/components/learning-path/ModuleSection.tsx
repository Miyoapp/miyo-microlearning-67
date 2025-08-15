
import React, { useState } from 'react';
import { Module, Lesson } from '@/types';
import LessonItem from './LessonItem';

interface ModuleSectionProps {
  module: Module;
  moduleLessons: Lesson[];
  lessonStatusMap: Map<string, any>;
  getLessonClasses: Map<string, any>;
  onLessonClick: (lesson: Lesson) => void;
  onLessonComplete: (lessonId: string) => void;
  onProgressUpdate: (lessonId: string, position: number) => void;
}

const ModuleSection = React.memo(({ 
  module, 
  moduleLessons, 
  lessonStatusMap, 
  getLessonClasses, 
  onLessonClick,
  onLessonComplete,
  onProgressUpdate
}: ModuleSectionProps) => {
  const [activeMiniPlayer, setActiveMiniPlayer] = useState<string | null>(null);
  
  if (moduleLessons.length === 0) return null;
  
  return (
    <div className="mb-8">
      {/* Module Title */}
      <div className="text-center mb-4 px-2">
        <h3 className="text-sm font-medium text-indigo-700 bg-indigo-50 inline-block py-2 px-4 rounded-full">
          {module.title}
        </h3>
      </div>
      
      {/* Lessons */}
      <div className="space-y-0">
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
              onLessonComplete={() => onLessonComplete(lesson.id)}
              onProgressUpdate={(position) => onProgressUpdate(lesson.id, position)}
              isActiveMiniPlayer={activeMiniPlayer === lesson.id}
              onActivatePlayer={() => setActiveMiniPlayer(lesson.id)}
            />
          );
        })}
      </div>
    </div>
  );
});

ModuleSection.displayName = 'ModuleSection';

export default ModuleSection;
