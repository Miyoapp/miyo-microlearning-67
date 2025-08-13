
import React from 'react';
import { Module, Lesson } from '@/types';
import StructuredLessonPlayer from './StructuredLessonPlayer';

interface StructuredModuleSectionProps {
  module: Module;
  moduleLessons: Lesson[];
  courseId: string;
  currentLessonId: string | null;
  lessonStatusMap: Map<string, any>;
  onPlay: (lesson: Lesson) => void;
  onPause: () => void;
  onComplete: (lesson: Lesson) => void;
  onProgressUpdate: (lesson: Lesson, progress: number) => void;
}

const StructuredModuleSection: React.FC<StructuredModuleSectionProps> = ({
  module,
  moduleLessons,
  courseId,
  currentLessonId,
  lessonStatusMap,
  onPlay,
  onPause,
  onComplete,
  onProgressUpdate
}) => {
  if (moduleLessons.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Module title */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 bg-indigo-50 inline-block py-2 px-4 rounded-full">
          {module.title}
        </h3>
      </div>
      
      {/* Lessons in this module */}
      <div className="space-y-4">
        {moduleLessons.map((lesson) => {
          const status = lessonStatusMap.get(lesson.id);
          if (!status) return null;
          
          const { isCompleted, isLocked, canPlay } = status;
          
          return (
            <StructuredLessonPlayer
              key={lesson.id}
              lesson={lesson}
              courseId={courseId}
              isActive={currentLessonId === lesson.id}
              canPlay={canPlay}
              isCompleted={isCompleted}
              isLocked={isLocked}
              onPlay={onPlay}
              onPause={onPause}
              onComplete={onComplete}
              onProgressUpdate={onProgressUpdate}
            />
          );
        })}
      </div>
    </div>
  );
};

export default StructuredModuleSection;
