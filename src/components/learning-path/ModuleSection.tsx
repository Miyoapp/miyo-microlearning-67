
import React from 'react';
import { Module, Lesson } from '@/types';
import LessonCard from './LessonCard';

interface ModuleSectionProps {
  module: Module;
  moduleLessons: Lesson[];
  lessonStatusMap: Map<string, any>;
  getLessonClasses: (lesson: Lesson, status: any) => string;
  currentLessonId: string | null;
  isGloballyPlaying: boolean;
  courseId: string | null;
  lessonProgress: any[];
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
  onAudioComplete?: () => void; // NEW: Audio completion callback
  onShowCompletionModal?: () => void; // NEW: Direct modal trigger
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
  onLessonComplete,
  onAudioComplete, // NEW
  onShowCompletionModal // NEW
}: ModuleSectionProps) => {
  return (
    <div key={module.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">{module.title}</h3>
      </div>
      
      <div className="p-6 space-y-4">
        {moduleLessons.map((lesson) => {
          const status = lessonStatusMap.get(lesson.id);
          if (!status) return null;

          const isCurrent = currentLessonId === lesson.id;
          const isPlaying = isCurrent && isGloballyPlaying;
          
          // Find saved progress for this lesson
          const savedProgress = courseId 
            ? lessonProgress.find(p => p.lesson_id === lesson.id && p.course_id === courseId)
            : undefined;

          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              canPlay={status.canPlay}
              isCompleted={status.isCompleted}
              isLocked={status.isLocked}
              isCurrent={isCurrent}
              isPlaying={isPlaying}
              className={getLessonClasses(lesson, status)}
              onLessonClick={onLessonClick}
              onProgressUpdate={onProgressUpdate}
              onLessonComplete={onLessonComplete}
              onAudioComplete={onAudioComplete} // NEW: Pass audio completion
              onShowCompletionModal={onShowCompletionModal} // NEW: Pass modal trigger
              savedProgress={savedProgress ? {
                current_position: savedProgress.current_position,
                is_completed: savedProgress.is_completed
              } : undefined}
            />
          );
        })}
      </div>
    </div>
  );
});

ModuleSection.displayName = 'ModuleSection';

export default ModuleSection;
