
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
  courseId: string | null;
  lessonProgress: UserLessonProgress[];
  audioState: any;
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
}

const ModuleSection = React.memo(({ 
  module, 
  moduleLessons, 
  lessonStatusMap, 
  getLessonClasses, 
  currentLessonId,
  courseId,
  lessonProgress,
  audioState,
  onLessonClick
}: ModuleSectionProps) => {
  if (moduleLessons.length === 0) return null;
  
  console.log('🏗️ ModuleSection render:', {
    moduleTitle: module.title,
    currentLessonId,
    isPlaying: audioState.isPlaying,
    lessonCount: moduleLessons.length,
    courseId,
    lessonProgressCount: lessonProgress.length
  });
  
  return (
    <div className="mb-8">
      {/* Module title */}
      <div className="text-center mb-4">
        <h3 className="text-sm font-medium text-indigo-700 bg-indigo-50 inline-block py-2 px-4 rounded-full">
          {module.title}
        </h3>
      </div>
      
      {/* Lesson cards */}
      <div className="space-y-4">
        {moduleLessons.map((lesson, index) => {
          const status = lessonStatusMap.get(lesson.id);
          if (!status) return null;
          
          const isCurrent = lesson.id === currentLessonId;
          const savedProgress = lessonProgress.find(p => p.lesson_id === lesson.id);
          
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
              courseId={courseId}
              savedProgress={savedProgress ? {
                current_position: savedProgress.current_position || 0,
                is_completed: savedProgress.is_completed || false
              } : undefined}
              audioState={audioState}
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
