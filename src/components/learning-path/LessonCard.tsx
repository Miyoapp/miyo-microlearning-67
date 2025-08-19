import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Lesson } from '@/types';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume1,
  Volume0,
  StickyNote,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { useUserLessonProgress } from '@/hooks/useUserLessonProgress';
import NotesPanel from '@/components/notes/NotesPanel';

interface LessonCardProps {
  lesson: Lesson;
  status: {
    canPlay: boolean;
    isCompleted: boolean;
    isLocked: boolean;
    isFirstInSequence: boolean;
  };
  isActive: boolean;
  isGloballyPlaying: boolean;
  courseId?: string | null;
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
}

const LessonCard = React.memo<LessonCardProps>(({
  lesson,
  status,
  isActive,
  isGloballyPlaying,
  courseId,
  onLessonClick,
  onProgressUpdate,
  onLessonComplete
}) => {
  const [notesOpen, setNotesOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { lessonProgress } = useUserLessonProgress();
  const [currentTime, setCurrentTime] = useState(0);

  const {
    playing,
    volume,
    muted,
    togglePlay,
    setVolume,
    toggleMute,
    duration,
    handleTimeUpdate,
    handleLoadedData,
    seek,
  } = useAudio(audioRef, lesson.urlAudio, isGloballyPlaying);

  const handleSkipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration);
      seek(newTime);
    }
  };

  const handleSkipBack = () => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - 10, 0);
      seek(newTime);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(event.target.value));
  };

  const handleToggleMute = () => {
    toggleMute();
  };

  const currentLessonProgress = lessonProgress.find(p => p.lesson_id === lesson.id);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = currentLessonProgress?.current_position || 0;
      setCurrentTime(currentLessonProgress?.current_position || 0);
    }
  }, [currentLessonProgress?.current_position, lesson.id]);

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current) {
        const currentPosition = audioRef.current.currentTime;
        const totalDuration = audioRef.current.duration;
        const progress = totalDuration ? (currentPosition / totalDuration) * 100 : 0;
        
        setCurrentTime(currentPosition);
        onProgressUpdate?.(progress);
      }
    };

    if (playing) {
      const intervalId = setInterval(updateProgress, 1000);
      return () => clearInterval(intervalId);
    }
  }, [playing, onProgressUpdate]);

  const handleLessonClickInner = useCallback((shouldAutoPlay = true) => {
    onLessonClick(lesson, shouldAutoPlay);
  }, [lesson, onLessonClick]);

  const handleNotesToggle = () => {
    console.log('🎵 LESSON CARD: Toggling notes for lesson:', lesson.id);
    setNotesOpen(!notesOpen);
  };

  const handleSeekToTime = (timeInSeconds: number) => {
    console.log('🎯 LESSON CARD: Seeking to time:', timeInSeconds, 'for lesson:', lesson.id);
    if (audioRef.current) {
      audioRef.current.currentTime = timeInSeconds;
    }
  };

  return (
    <>
      <div className={cn(
        "border border-gray-200 rounded-xl p-4 transition-all duration-200 shadow-sm",
        isActive ? "bg-gray-50 border-[#5e16ea] shadow-md" : "bg-white",
        status.isLocked && "opacity-50 cursor-not-allowed"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLessonClickInner(!playing)}
              disabled={status.isLocked}
              className={cn(
                "p-2 rounded-full transition-colors",
                status.canPlay
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  : "text-gray-400 cursor-not-allowed",
                isActive && "bg-[#5e16ea] text-white hover:bg-[#4a11ba]",
                status.isLocked && "cursor-not-allowed"
              )}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing && isActive ? (
                <Pause size={16} />
              ) : (
                <Play size={16} />
              )}
            </button>
            <h3 className="font-medium text-gray-900">
              {lesson.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Duration display */}
            <span className="text-xs text-gray-500">
              {Math.floor(lesson.duracion / 60)}:{(lesson.duracion % 60).toString().padStart(2, '0')}
            </span>

            {/* Notes button */}
            <button
              onClick={handleNotesToggle}
              className={cn(
                "p-2 rounded-lg transition-colors relative",
                notesOpen 
                  ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
              title={notesOpen ? "Ocultar notas" : "Ver notas"}
            >
              <StickyNote size={16} />
              {/* Notes count badge would go here if we had note count */}
            </button>

            {/* Lock icon for locked lessons */}
            {status.isLocked && (
              <Lock size={16} className="text-gray-400" title="Lección bloqueada" />
            )}
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-2">
            <button onClick={handleSkipBack} className="text-gray-500 hover:text-gray-700">
              <SkipBack size={16} />
            </button>
            <button onClick={handleSkipForward} className="text-gray-500 hover:text-gray-700">
              <SkipForward size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleToggleMute}>
              {muted ? <Volume0 size={16} className="text-gray-500" /> : <Volume1 size={16} className="text-gray-500" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>
      </div>

      {/* Notes Panel - Integrated below the card */}
      <NotesPanel
        isOpen={notesOpen}
        lessonId={lesson.id}
        courseId={courseId || ''}
        currentTimeSeconds={currentTime}
        onSeekToTime={handleSeekToTime}
      />
    </>
  );
});

export default LessonCard;
