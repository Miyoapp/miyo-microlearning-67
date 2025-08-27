
import React from 'react';
import { Module } from '@/types';
import { UserLessonProgress } from '@/hooks/lesson-progress/types';
import LessonCard from './LessonCard';
import { useLessonStatus } from '@/hooks/learning-path/useLessonStatus';
import { useLessonClasses } from '@/hooks/learning-path/useLessonClasses';

interface ModuleSectionProps {
  module: Module;
  // Reproductor centralizado
  currentLesson: any;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  courseId: string | null;
  lessonProgress: UserLessonProgress[];
  // Callbacks
  onLessonClick: (lesson: any, shouldAutoPlay?: boolean) => void;
  onSeek: (time: number) => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  formatTime: (time: number) => string;
}

const ModuleSection = React.memo(({
  module,
  currentLesson,
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  volume,
  isMuted,
  courseId,
  lessonProgress,
  onLessonClick,
  onSeek,
  onSkipBackward,
  onSkipForward,
  onPlaybackRateChange,
  onVolumeChange,
  onToggleMute,
  formatTime
}: ModuleSectionProps) => {
  const lessonStatusHook = useLessonStatus();
  const lessonClassesHook = useLessonClasses();

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-[#5e16ea] to-[#8b5cf6] text-white px-6 py-4 rounded-t-lg">
        <h3 className="text-lg font-semibold">{module.titulo}</h3>
        {module.descripcion && (
          <p className="text-sm text-white/80 mt-1">{module.descripcion}</p>
        )}
      </div>
      
      <div className="bg-white rounded-b-lg border border-t-0 border-gray-200 p-6">
        <div className="space-y-4">
          {module.lessons?.map((lesson, index) => {
            const status = lessonStatusHook.getLessonStatus(lesson, currentLesson);
            
            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                index={index}
                status={status}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                playbackRate={playbackRate}
                volume={volume}
                isMuted={isMuted}
                courseId={courseId}
                lessonProgress={lessonProgress}
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
    </div>
  );
});

ModuleSection.displayName = 'ModuleSection';

export default ModuleSection;
