
import React from 'react';
import LearningPath from '@/components/LearningPath';
import LearningPathErrorBoundary from '@/components/learning-path/LearningPathErrorBoundary';
import { Podcast, Lesson } from '@/types';

interface CourseLearningPathSectionProps {
  podcast: Podcast;
  onSelectLesson: (lesson: Lesson) => void;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
  // UNIFIED AUDIO PROPS - single source of truth
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

const CourseLearningPathSection: React.FC<CourseLearningPathSectionProps> = ({
  podcast,
  onSelectLesson,
  onProgressUpdate,
  onLessonComplete,
  // UNIFIED AUDIO PROPS
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
}) => {
  console.log('🎓 CourseLearningPathSection render:', {
    courseTitle: podcast.title,
    hasLessons: podcast.lessons?.length > 0,
    hasModules: podcast.modules?.length > 0,
    audioCurrentLessonId,
    audioIsPlaying
  });

  // POST-REFACTOR DEBUG: Verificar datos críticos para renderizado
  console.log('🔍 POST-REFACTOR DEBUG - CourseLearningPathSection:', {
    podcastValid: !!podcast,
    lessonsCount: podcast?.lessons?.length || 0,
    modulesCount: podcast?.modules?.length || 0,
    audioCurrentLessonId,
    audioIsPlaying,
    audioIsReady,
    audioError,
    hasValidData: !!(podcast?.lessons?.length && podcast?.modules?.length)
  });

  // EARLY RETURN CHECK: Verificar si hay early returns problemáticos
  if (!podcast) {
    console.log('❌ CourseLearningPathSection: No podcast data - returning null');
    return null;
  }

  if (!podcast.lessons || podcast.lessons.length === 0) {
    console.log('❌ CourseLearningPathSection: No lessons available - returning null');
    return null;
  }

  if (!podcast.modules || podcast.modules.length === 0) {
    console.log('❌ CourseLearningPathSection: No modules available - returning null');
    return null;
  }

  console.log('✅ CourseLearningPathSection: All validations passed - rendering LearningPath');

  return (
    <div id="learning-path-section" className="bg-white rounded-2xl shadow-sm p-6">
      <LearningPathErrorBoundary>
        <LearningPath 
          lessons={podcast.lessons}
          modules={podcast.modules}
          onSelectLesson={onSelectLesson}
          onProgressUpdate={onProgressUpdate}
          onLessonComplete={onLessonComplete}
          podcast={podcast}
          // UNIFIED AUDIO PROPS - pass all audio state
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
      </LearningPathErrorBoundary>
    </div>
  );
};

export default CourseLearningPathSection;
