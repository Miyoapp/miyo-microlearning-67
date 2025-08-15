import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, StickyNote, Plus, Lock } from 'lucide-react';
import { Lesson } from '@/types';
import { cn } from '@/lib/utils';
import { useAudioNotes } from '@/hooks/useAudioNotes';
import { useUserLessonProgress } from '@/hooks/useUserLessonProgress';
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [showImmediateCompletion, setShowImmediateCompletion] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { notes, addNote, updateNote, deleteNote, loading: notesLoading } = useAudioNotes(lesson.id, courseId);
  const { lessonProgress } = useUserLessonProgress();

  // Obtener progreso guardado para esta lección
  const savedProgress = lessonProgress.find(p => p.lesson_id === lesson.id);

  // CRÍTICO: Debug del estado visual
  useEffect(() => {
    console.log(`🎨 StructuredLessonPlayer Visual State for "${lesson.title}":`, {
      isCompleted: isCompleted ? '🏆 COMPLETADA' : '❌ NO COMPLETADA',
      canPlay: canPlay ? '▶️ PUEDE REPRODUCIR' : '🔒 BLOQUEADA',
      isLocked: isLocked ? '🔒 LOCKED' : '🔓 UNLOCKED',
      isActive: isActive ? '🎵 ACTIVA' : '⏸️ INACTIVA',
      expectedButtonIcon: canPlay ? 'PLAY (▶️)' : 'LOCK (🔒)',
      visualError: isCompleted && isLocked ? '🚨 ERROR: COMPLETED BUT LOCKED!' : '✅ OK'
    });
  }, [lesson.title, isCompleted, canPlay, isLocked, isActive]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      audio.playbackRate = playbackRate;
      
      // CORREGIDO: Lógica de inicialización mejorada
      if (isCompleted) {
        console.log('🏆 Completed lesson - showing 100% progress:', lesson.title);
        const finalTime = audio.duration;
        setCurrentTime(finalTime);
        audio.currentTime = finalTime;
      } else {
        console.log('🆕 Non-completed lesson - starting from 0:', lesson.title);
        setCurrentTime(0);
        audio.currentTime = 0;
      }
    };

    const handleTimeUpdate = () => {
      const newCurrentTime = audio.currentTime;
      setCurrentTime(newCurrentTime);
      
      const progress = (newCurrentTime / audio.duration) * 100;
      
      if (!isNaN(progress) && progress > 0) {
        onProgressUpdate(lesson, progress);
      }
    };

    const handleEnded = () => {
      console.log('🏁 Audio ended for lesson:', lesson.title);
      
      setCurrentTime(duration);
      onProgressUpdate(lesson, 100);
      
      // NUEVO: Mostrar completion inmediato solo si no estaba completada
      if (!isCompleted) {
        setShowImmediateCompletion(true);
        console.log('✅ Showing immediate completion for newly completed lesson:', lesson.title);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
          setShowImmediateCompletion(false);
        }, 3000);
      }
      
      console.log('🎯 Calling onComplete for auto-advance logic');
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
  }, [lesson, onComplete, onProgressUpdate, playbackRate, duration, isCompleted]);

  // Control de reproducción
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isActive) {
      console.log('▶️ Starting playback for:', lesson.title);
      
      if (!isCompleted) {
        console.log('🔄 Resetting to start for non-completed lesson');
        audio.currentTime = 0;
        setCurrentTime(0);
      } else {
        console.log('🏆 Completed lesson - maintaining current position');
      }
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    } else {
      console.log('⏸️ Pausing playback for:', lesson.title);
      audio.pause();
    }
  }, [isActive, lesson.title, isCompleted]);

  // Reset para cambios de lección
  useEffect(() => {
    if (!isCompleted) {
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
    // Reset del estado de completion inmediata al cambiar de lección
    setShowImmediateCompletion(false);
  }, [lesson.id, isCompleted]);

  const handlePlayPause = () => {
    if (!canPlay) {
      console.log('🚫 Cannot play - lesson is locked:', lesson.title);
      return;
    }

    if (isActive) {
      onPause();
    } else {
      onPlay(lesson);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      setCurrentTime(time);
      audioRef.current.currentTime = time;
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
    if (!isActive && canPlay) {
      onPlay(lesson);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // MEJORADO: Estado de completado más preciso
  const shouldShowCompletedStatus = () => {
    return showImmediateCompletion || (isCompleted && !isActive);
  };

  // REFORZADO: Estilos de botón consistentes para lecciones reproducibles
  const getButtonClasses = () => {
    if (!canPlay) {
      return "bg-gray-300 text-gray-500 cursor-not-allowed";
    }
    // TODAS las lecciones reproducibles (incluyendo completadas) usan el mismo estilo purple
    return "bg-[#5e16ea] text-white hover:bg-[#4a11ba]";
  };

  const getButtonIcon = () => {
    if (isLocked) {
      console.log('🔒 Showing lock icon for locked lesson:', lesson.title);
      return <Lock size={16} />;
    }
    if (isActive) {
      console.log('⏸️ Showing pause icon for active lesson:', lesson.title);
      return <Pause size={16} />;
    }
    // TODAS las lecciones reproducibles muestran play (incluyendo completadas)
    console.log('▶️ Showing play icon for playable lesson:', lesson.title, 'isCompleted:', isCompleted);
    return <Play size={16} className="ml-0.5" />;
  };

  return (
    <div className={cn(
      "bg-white rounded-xl border-2 p-4 transition-all duration-200",
      {
        "border-[#5e16ea] shadow-lg": isActive,
        "border-gray-200 hover:border-gray-300": !isActive,
        "opacity-60": isLocked && !canPlay
      }
    )}>
      <audio
        ref={audioRef}
        src={lesson.urlAudio}
        preload="metadata"
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <button
            onClick={handlePlayPause}
            disabled={!canPlay}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0",
              getButtonClasses()
            )}
          >
            {getButtonIcon()}
          </button>

          <div className="min-w-0 flex-1">
            <h4 className={cn(
              "font-medium truncate",
              {
                "text-[#5e16ea]": canPlay,
                "text-gray-900": !canPlay
              }
            )}>
              {lesson.title}
            </h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              {isActive && (
                <span className="text-[#5e16ea] font-medium">● Reproduciendo</span>
              )}
              {/* MEJORADO: Check de completado más preciso */}
              {shouldShowCompletedStatus() && (
                <span className="text-green-600 font-medium">✓ Completada</span>
              )}
            </div>
          </div>
        </div>

        {canPlay && (
          <div className="relative">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="p-2 text-gray-400 hover:text-[#5e16ea] hover:bg-indigo-50 rounded-lg transition-colors relative"
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

      <LessonProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        disabled={!canPlay}
      />

      {canPlay && (
        <LessonAudioControls
          playbackRate={playbackRate}
          onPlaybackRateChange={handlePlaybackRateChange}
          onSeekBackward={handleSeekBackward}
          onSeekForward={handleSeekForward}
          disabled={!canPlay}
        />
      )}

      {showNotes && canPlay && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-gray-700">
              Mis notas ({notes.length})
            </h5>
            <button
              onClick={() => setShowAddNote(!showAddNote)}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-[#5e16ea] text-white rounded hover:bg-[#4a11ba] transition-colors"
            >
              <Plus size={12} />
              <span>Agregar nota</span>
            </button>
          </div>

          {showAddNote && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-2">
                En {formatTime(currentTime)}
              </div>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Escribe tu nota aquí..."
                className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-[#5e16ea] focus:border-[#5e16ea]"
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
                  className="px-3 py-1 text-xs bg-[#5e16ea] text-white rounded hover:bg-[#4a11ba] disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

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
