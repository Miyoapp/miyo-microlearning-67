
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, StickyNote, Plus, ChevronDown, ChevronUp, Trophy, Lock } from 'lucide-react';
import { Lesson } from '@/types';
import { cn } from '@/lib/utils';
import { useAudioNotes } from '@/hooks/useAudioNotes';
import LessonProgressBar from './LessonProgressBar';
import LessonAudioControls from './LessonAudioControls';
import LessonNotesSection from './LessonNotesSection';

interface StructuredLessonPlayerProps {
  lesson: Lesson;
  courseId: string;
  isActive: boolean;
  canPlay: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  onPlay: (lesson: Lesson) => void;
  onPause: () => void;
  onComplete: (lesson: Lesson) => void;
  onProgressUpdate: (lesson: Lesson, progress: number) => void;
}

const StructuredLessonPlayer: React.FC<StructuredLessonPlayerProps> = ({
  lesson,
  courseId,
  isActive,
  canPlay,
  isCompleted,
  isLocked,
  onPlay,
  onPause,
  onComplete,
  onProgressUpdate
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const { notes, addNote, updateNote, deleteNote, loading: notesLoading } = useAudioNotes(lesson.id, courseId);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      audio.playbackRate = playbackRate;
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const progress = (audio.currentTime / audio.duration) * 100;
      onProgressUpdate(lesson, progress);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete(lesson);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [lesson, onComplete, onProgressUpdate, playbackRate]);

  // Control playback state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isActive && isPlaying) {
      audio.play();
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [isActive, isPlaying]);

  const handlePlayPause = () => {
    if (!canPlay) return;

    if (isPlaying) {
      setIsPlaying(false);
      onPause();
    } else {
      setIsPlaying(true);
      onPlay(lesson);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSeekBackward = () => {
    const newTime = Math.max(0, currentTime - 15);
    handleSeek(newTime);
  };

  const handleSeekForward = () => {
    const newTime = Math.min(duration, currentTime + 15);
    handleSeek(newTime);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleAddNote = async () => {
    if (newNoteText.trim()) {
      await addNote(newNoteText.trim(), currentTime);
      setNewNoteText('');
      setShowAddNote(false);
    }
  };

  const handleJumpToTime = (time: number) => {
    handleSeek(time);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "bg-white rounded-xl border-2 p-4 transition-all duration-200",
      {
        "border-indigo-300 shadow-lg": isActive,
        "border-gray-200 hover:border-gray-300": !isActive,
        "opacity-60": isLocked && !isCompleted
      }
    )}>
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={lesson.urlAudio}
        preload="metadata"
      />

      {/* Header with title and controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <button
            onClick={handlePlayPause}
            disabled={!canPlay}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0",
              {
                "bg-yellow-500 text-white hover:bg-yellow-600": isCompleted,
                "bg-indigo-600 text-white hover:bg-indigo-700": !isCompleted && canPlay,
                "bg-gray-300 text-gray-500 cursor-not-allowed": !canPlay
              }
            )}
          >
            {isCompleted ? (
              <Trophy size={18} />
            ) : isLocked ? (
              <Lock size={16} />
            ) : isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} className="ml-0.5" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-gray-900 truncate">{lesson.title}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              {isActive && (
                <span className="text-indigo-600 font-medium">● Reproduciendo</span>
              )}
            </div>
          </div>
        </div>

        {/* Notes icon with counter */}
        {canPlay && (
          <div className="relative">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative"
              title={showNotes ? "Ocultar notas" : "Ver notas"}
            >
              <StickyNote size={20} />
              {notes.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {notes.length}
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <LessonProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        disabled={!canPlay}
      />

      {/* Audio controls */}
      {canPlay && (
        <LessonAudioControls
          playbackRate={playbackRate}
          onPlaybackRateChange={handlePlaybackRateChange}
          onSeekBackward={handleSeekBackward}
          onSeekForward={handleSeekForward}
          disabled={!canPlay}
        />
      )}

      {/* Notes section */}
      {showNotes && canPlay && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-gray-700">
              Mis notas ({notes.length})
            </h5>
            <button
              onClick={() => setShowAddNote(!showAddNote)}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              <Plus size={12} />
              <span>Agregar nota</span>
            </button>
          </div>

          {/* Add note section */}
          {showAddNote && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-2">
                En {formatTime(currentTime)}
              </div>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Escribe tu nota aquí..."
                className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setShowAddNote(false);
                    setNewNoteText('');
                  }}
                  className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNoteText.trim() || notesLoading}
                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          {/* Notes list */}
          <LessonNotesSection
            notes={notes}
            onJumpToTime={handleJumpToTime}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
            isLoading={notesLoading}
          />
        </div>
      )}
    </div>
  );
};

export default StructuredLessonPlayer;
