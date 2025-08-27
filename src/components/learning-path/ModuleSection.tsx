
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
  // Nuevos props para controles centralizados
  currentTime?: number;
  duration?: number;
  playbackRate?: number;
  volume?: number;
  isMuted?: boolean;
  onSeek?: (time: number) => void;
  onSkipBackward?: () => void;
  onSkipForward?: () => void;
  onPlaybackRateChange?: (rate: number) => void;
  onVolumeChange?: (volume: number) => void;
  onToggleMute?: () => void;
  formatTime?: (time: number) => string;
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
  // Nuevos props centralizados
  currentTime = 0,
  duration = 0,
  playbackRate = 1,
  volume = 1,
  isMuted = false,
  onSeek = () => {},
  onSkipBackward = () => {},
  onSkipForward = () => {},
  onPlaybackRateChange = () => {},
  onVolumeChange = () => {},
  onToggleMute = () => {},
  formatTime = (time: number) => `${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, '0')}`
}: ModuleSectionProps) => {
  if (moduleLessons.length === 0) return null;
  
  console.log('🏗️ ModuleSection render:', {
    moduleTitle: module.title,
    currentLessonId,
    isGloballyPlaying,
    lessonCount: moduleLessons.length,
    courseId,
    lessonProgressCount: lessonProgress.length
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
          
          // Find saved progress for this specific lesson
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
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              playbackRate={playbackRate}
              volume={volume}
              isMuted={isMuted}
              courseId={courseId}
              savedProgress={savedProgress ? {
                current_position: savedProgress.current_position || 0,
                is_completed: savedProgress.is_completed || false
              } : undefined}
              onLessonClick={onLessonClick}
              onSeek={onSeek}
              onSkipBackward={onSkipBackward}
              onSkipForward={onSkipForward}
              onPlaybackRateChange={onPlaybackRateChange}
              onVolumeChange={onVolumeChange}
              onToggleMute={onToggleMute}
              formatTime={formatTime}
            />
          );
        })}
      </div>
    </div>
  );
});

ModuleSection.displayName = 'ModuleSection';

export default ModuleSection;
