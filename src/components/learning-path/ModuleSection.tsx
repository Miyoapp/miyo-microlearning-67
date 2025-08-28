
import React from 'react';
import { Module, Lesson } from '@/types';
import { UserLessonProgress } from '@/hooks/useUserLessonProgress';
import LessonCard from './LessonCard';

interface ModuleSectionProps {
  module: Module;
  moduleLessons: Lesson[];
  lessonStatusMap: Map<string, any>;
  getLessonClasses: Map<string, any>;
  courseId: string | null;
  lessonProgress: UserLessonProgress[];
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
  // UNIFIED AUDIO PROPS - consistent naming
  audioCurrentLessonId: string | null;
  audioIsPlaying: boolean;
  audioCurrentTime: number;
  audioDuration: number;
  audioIsReady: boolean;
  audioError: boolean;
  getDisplayProgress: (lessonId: string, validDuration?: number) => number;
  onPlay: (lesson: Lesson) => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onSetPlaybackRate: (rate: number) => void;
  onSetVolume: (volume: number) => void;
  onSetMuted: (muted: boolean) => void;
}

const ModuleSection = React.memo(({ 
  module, 
  moduleLessons, 
  lessonStatusMap, 
  getLessonClasses, 
  courseId,
  lessonProgress,
  onLessonClick,
  onProgressUpdate,
  onLessonComplete,
  // UNIFIED AUDIO PROPS - use consistent naming
  audioCurrentLessonId,
  audioIsPlaying,
  audioCurrentTime,
  audioDuration,
  audioIsReady,
  audioError,
  getDisplayProgress,
  onPlay,
  onPause,
  onSeek,
  onSkipBackward,
  onSkipForward,
  onSetPlaybackRate,
  onSetVolume,
  onSetMuted
}: ModuleSectionProps) => {
  if (moduleLessons.length === 0) return null;
  
  console.log('🏗️ ModuleSection render (UNIFIED):', {
    moduleTitle: module.title,
    lessonCount: moduleLessons.length,
    courseId,
    lessonProgressCount: lessonProgress.length,
    audioCurrentLessonId,
    audioIsPlaying
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
          
          // Find saved progress for this specific lesson
          const savedProgress = lessonProgress.find(p => p.lesson_id === lesson.id);
          
          const enhancedStatus = {
            ...status,
            isCurrent: lesson.id === audioCurrentLessonId
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
              // UNIFIED PROPS - pass only unified audio state
              audioCurrentLessonId={audioCurrentLessonId}
              audioIsPlaying={audioIsPlaying}
              audioCurrentTime={audioCurrentTime}
              audioDuration={audioDuration}
              audioIsReady={audioIsReady}
              audioError={audioError}
              getDisplayProgress={getDisplayProgress}
              onPlay={onPlay}
              onPause={onPause}
              onSeek={onSeek}
              onSkipBackward={onSkipBackward}
              onSkipForward={onSkipForward}
              onSetPlaybackRate={onSetPlaybackRate}
              onSetVolume={onSetVolume}
              onSetMuted={onSetMuted}
            />
          );
        })}
      </div>
    </div>
  );
});

ModuleSection.displayName = 'ModuleSection';

export default ModuleSection;
