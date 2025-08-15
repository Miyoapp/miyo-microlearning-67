
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
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
  globalCurrentTime?: number;
  globalDuration?: number;
  onSeek?: (value: number) => void;
  onSkipBackward?: () => void;
  onSkipForward?: () => void;
  onPlaybackRateChange?: (rate: number) => void;
}

const ModuleSection = React.memo(({ 
  module, 
  moduleLessons, 
  lessonStatusMap, 
  getLessonClasses, 
  currentLessonId,
  isGloballyPlaying,
  onLessonClick,
  globalCurrentTime = 0,
  globalDuration = 0,
  onSeek,
  onSkipBackward,
  onSkipForward,
  onPlaybackRateChange
}: ModuleSectionProps) => {
  if (moduleLessons.length === 0) return null;
  
  console.log('🏗️ ModuleSection render:', {
    moduleTitle: module.title,
    currentLessonId,
    isGloballyPlaying,
    lessonCount: moduleLessons.length,
    globalCurrentTime,
    globalDuration
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
          
          // Add isCurrent calculation
          const enhancedStatus = {
            ...status,
            isCurrent: lesson.id === currentLessonId
          };
          
          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index}
              status={enhancedStatus}
              isGloballyPlaying={isGloballyPlaying}
              onLessonClick={onLessonClick}
              globalCurrentTime={globalCurrentTime}
              globalDuration={globalDuration}
              onSeek={onSeek}
              onSkipBackward={onSkipBackward}
              onSkipForward={onSkipForward}
              onPlaybackRateChange={onPlaybackRateChange}
            />
          );
        })}
      </div>
    </div>
  );
});

ModuleSection.displayName = 'ModuleSection';

export default ModuleSection;
