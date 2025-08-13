
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lesson } from '@/types';
import LessonProgressBar from './LessonProgressBar';
import LessonNotesSection from './LessonNotesSection';
import { useAudioNotes } from '@/hooks/useAudioNotes';

interface StructuredLessonPlayerProps {
  lesson: Lesson;
  courseId: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onComplete: () => void;
  onProgressUpdate: (lesson: Lesson, progress: number) => void;
}

const StructuredLessonPlayer: React.FC<StructuredLessonPlayerProps> = ({
  lesson,
  courseId,
  isPlaying,
  onPlay,
  onPause,
  onComplete,
  onProgressUpdate
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const hasCompletedRef = useRef(false);
  const lastProgressRef = useRef(0);

  // Use audio notes hook
  const {
    notes,
    isLoading: notesLoading,
    addNote,
    updateNote,
    deleteNote
  } = useAudioNotes(lesson.id);

  // CORREGIDO: Inicializar progreso basado en el estado de la lección
  useEffect(() => {
    if (lesson) {
      console.log('🎵 Lesson changed in player:', {
        title: lesson.title,
        isCompleted: lesson.isCompleted,
        shouldStartFromBeginning: 'Always start from 0 for consistent UX'
      });
      
      // CORREGIDO: Siempre empezar desde el principio para UX consistente
      // tanto para lecciones nuevas como completadas que se vuelven a reproducir
      setCurrentTime(0);
      lastProgressRef.current = 0;
      hasCompletedRef.current = false;
      
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  }, [lesson?.id]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      console.log('▶️ Starting playback for:', lesson.title);
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    } else {
      console.log('⏸️ Pausing playback for:', lesson.title);
      audioRef.current.pause();
    }
  }, [isPlaying, lesson.title]);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;

    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration || 0;
    
    setCurrentTime(current);
    setDuration(total);

    if (total > 0) {
      const progressPercent = (current / total) * 100;
      
      // Solo reportar progreso cada 5% para evitar spam
      if (Math.abs(progressPercent - lastProgressRef.current) >= 5) {
        lastProgressRef.current = progressPercent;
        onProgressUpdate(lesson, progressPercent);
      }

      // Detectar finalización (95% o más)
      if (progressPercent >= 95 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        console.log('🏁 Lesson completed:', lesson.title);
        onComplete();
      }
    }
  }, [lesson, onProgressUpdate, onComplete]);

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleJumpToTime = useCallback((seconds: number) => {
    handleSeek(seconds);
    if (!isPlaying) {
      onPlay();
    }
  }, [handleSeek, isPlaying, onPlay]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const handleSkip = useCallback((seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration));
      handleSeek(newTime);
    }
  }, [duration, handleSeek]);

  const handleRestart = useCallback(() => {
    console.log('🔄 Restarting lesson:', lesson.title);
    handleSeek(0);
    hasCompletedRef.current = false;
    lastProgressRef.current = 0;
  }, [lesson.title, handleSeek]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!lesson.urlAudio) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No hay audio disponible para esta lección</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{lesson.title}</h3>
            {lesson.description && (
              <p className="text-sm text-gray-600 mb-4">{lesson.description}</p>
            )}
          </div>

          <LessonProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Velocidad:</span>
              <select
                value={playbackRate}
                onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                className="text-sm border rounded px-2 py-1"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSkip(-10)}
            >
              <SkipBack className="w-4 h-4" />
              -10s
            </Button>

            <Button
              onClick={isPlaying ? onPause : onPlay}
              size="lg"
              className="bg-[#5e16ea] hover:bg-[#4a11ba] text-white w-16 h-16 rounded-full"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSkip(10)}
            >
              <SkipForward className="w-4 h-4" />
              +10s
            </Button>
          </div>

          <audio
            ref={audioRef}
            src={lesson.urlAudio}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setDuration(audioRef.current.duration);
              }
            }}
            onEnded={() => {
              console.log('🏁 Audio ended naturally for:', lesson.title);
              if (!hasCompletedRef.current) {
                hasCompletedRef.current = true;
                onComplete();
              }
            }}
            preload="metadata"
          />
        </CardContent>
      </Card>

      <LessonNotesSection
        notes={notes}
        onJumpToTime={handleJumpToTime}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
        isLoading={notesLoading}
      />
    </div>
  );
};

export default StructuredLessonPlayer;
