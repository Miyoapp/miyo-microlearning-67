
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Plus, ChevronDown, ChevronUp, Trophy, Lock } from 'lucide-react';
import { Lesson } from '@/types';
import { cn } from '@/lib/utils';
import { useAudioNotes } from '@/hooks/useAudioNotes';
import AddNoteModal from '@/components/audio/AddNoteModal';
import NotesList from '@/components/audio/NotesList';
import LessonProgressBar from './LessonProgressBar';
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
  const [showAddNote, setShowAddNote] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { notes, addNote, updateNote, deleteNote, loading: notesLoading } = useAudioNotes(lesson.id, courseId);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
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
  }, [lesson, onComplete, onProgressUpdate]);

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

  const handleAddNote = (noteText: string) => {
    addNote(noteText, currentTime);
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

      {/* Header with title and status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePlayPause}
            disabled={!canPlay}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
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

          <div>
            <h4 className="font-medium text-gray-900">{lesson.title}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              {isActive && (
                <span className="text-indigo-600 font-medium">● Reproduciendo</span>
              )}
            </div>
          </div>
        </div>

        {/* Notes counter and controls */}
        <div className="flex items-center space-x-2">
          {notes.length > 0 && (
            <div className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">
              {notes.length}
            </div>
          )}
          
          {canPlay && (
            <>
              <button
                onClick={() => setShowAddNote(true)}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Agregar nota"
              >
                <Plus size={16} />
              </button>
              
              {notes.length > 0 && (
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title={showNotes ? "Ocultar notas" : "Ver notas"}
                >
                  {showNotes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <LessonProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        disabled={!canPlay}
      />

      {/* Notes section */}
      {showNotes && notes.length > 0 && (
        <LessonNotesSection
          notes={notes}
          onJumpToTime={handleJumpToTime}
          onUpdateNote={updateNote}
          onDeleteNote={deleteNote}
          isLoading={notesLoading}
        />
      )}

      {/* Add note modal */}
      <AddNoteModal
        isOpen={showAddNote}
        onClose={() => setShowAddNote(false)}
        onSave={handleAddNote}
        currentTime={currentTime}
        isLoading={notesLoading}
      />
    </div>
  );
};

export default StructuredLessonPlayer;
