
import React from 'react';
import { Lesson } from '@/types';
import { LessonNote } from '@/types/notes';
import { Play, Pause, Lock, SkipBack, SkipForward, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useNotes } from '@/hooks/useNotes';
import NotesPanel from '@/components/notes/NotesPanel';

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  formatTime: (time: number) => string;
  seek: (time: number) => void;
  skipBackward: () => void;
  skipForward: () => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleMute: () => void;
}

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  status: {
    isCompleted: boolean;
    isLocked: boolean;
    isCurrent: boolean;
    canPlay: boolean;
    isFirstInSequence: boolean;
  };
  courseId: string | null;
  savedProgress?: {
    current_position: number;
    is_completed: boolean;
  };
  audioState: AudioState;
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
}

const LessonCard = React.memo(({ 
  lesson, 
  index, 
  status, 
  courseId,
  savedProgress,
  audioState,
  onLessonClick
}: LessonCardProps) => {
  const { isCompleted, isLocked, isCurrent, canPlay } = status;
  
  console.log('🎴 LessonCard render:', {
    lessonTitle: lesson.title,
    isCurrent,
    isPlaying: audioState.isPlaying,
    canPlay,
    isCompleted: savedProgress?.is_completed
  });
  
  // Notes functionality
  const { notes, addNote, updateNote, deleteNote, fetchNotes } = useNotes(
    canPlay ? lesson.id : undefined, 
    canPlay ? courseId : undefined
  );
  const [showNotesPanel, setShowNotesPanel] = React.useState(false);
  
  // Local UI state for dropdowns
  const [showSpeedDropdown, setShowSpeedDropdown] = React.useState(false);
  const [showVolumeControl, setShowVolumeControl] = React.useState(false);

  // Play/pause handler - connects to centralized audio
  const handlePlayPause = () => {
    console.log('🎵 LessonCard: Play/pause clicked for:', lesson.title);
    
    if (!canPlay) {
      console.log('🚫 Cannot play - lesson is locked');
      return;
    }
    
    // Call parent with toggle instruction
    onLessonClick(lesson, !audioState.isPlaying);
  };

  // Progress display logic
  const validDuration = audioState.duration || lesson.duracion;
  
  const displayCurrentTime = useMemo(() => {
    // For completed lessons, always show full duration
    if (savedProgress?.is_completed) {
      console.log('📊 Completed lesson - showing full duration:', lesson.title);
      return validDuration;
    }
    
    // For current playing lesson, show real-time progress
    if (isCurrent) {
      console.log('📊 Current lesson - showing real-time progress:', lesson.title, audioState.currentTime);
      return Math.min(audioState.currentTime, validDuration);
    }
    
    // For other lessons, show saved progress
    const savedTime = savedProgress?.current_position || 0;
    console.log('📊 Other lesson - showing saved progress:', lesson.title, savedTime);
    return Math.min(savedTime, validDuration);
  }, [
    audioState.currentTime, 
    validDuration, 
    savedProgress?.is_completed, 
    savedProgress?.current_position,
    isCurrent, 
    lesson.title
  ]);

  // Handle seek (only for current lesson)
  const handleSeek = (time: number) => {
    if (isCurrent) {
      audioState.seek(time);
    }
  };

  // Handle seek change from slider
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    handleSeek(value);
  };

  // Control handlers (only active for current lesson)
  const handleSkipBackward = () => {
    if (isCurrent) audioState.skipBackward();
  };

  const handleSkipForward = () => {
    if (isCurrent) audioState.skipForward();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCurrent) {
      const newVolume = parseFloat(e.target.value);
      audioState.setVolume(newVolume);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (isCurrent) {
      audioState.setPlaybackRate(rate);
      setShowSpeedDropdown(false);
    }
  };

  const toggleMute = () => {
    if (isCurrent) audioState.toggleMute();
  };

  // Fetch notes when lesson can play
  React.useEffect(() => {
    if (canPlay && courseId) {
      fetchNotes();
    }
  }, [canPlay, courseId, fetchNotes]);

  // Handle adding note
  const handleAddNote = async (noteText: string) => {
    await addNote(noteText, displayCurrentTime);
  };

  const handleEditNote = async (noteId: string, updates: Partial<Pick<LessonNote, 'note_text' | 'note_title' | 'tags' | 'is_favorite'>>) => {
    await updateNote(noteId, updates);
  };

  const handleSeekToNote = (timeInSeconds: number) => {
    handleSeek(timeInSeconds);
  };

  const handleNotesToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotesPanel(!showNotesPanel);
  };

  // Speed options
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Status icon logic
  const getStatusIcon = () => {
    if (!canPlay) {
      return <Lock size={16} />;
    }
    
    // Show pause icon ONLY if this is current lesson AND audio is playing
    if (isCurrent && audioState.isPlaying && !audioState.error) {
      return <Pause size={16} />;
    }
    
    // Show play icon in all other cases
    return <Play size={16} fill="white" />;
  };

  return (
    <div className={cn(
      "bg-white rounded-lg border shadow-sm transition-all duration-200",
      {
        "border-[#5e16ea] shadow-md": isCompleted || (isCurrent && !isCompleted),
        "border-gray-200": !isCurrent && !isCompleted && canPlay,
        "border-gray-100 bg-gray-50": !canPlay,
        "hover:shadow-md": canPlay,
        "cursor-not-allowed": !canPlay,
        "border-red-200 bg-red-50": audioState.error && isCurrent
      }
    )}>
      {/* Main Card Content */}
      <div className="p-4">
        {/* Header with title and status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Status/Play Button */}
            <button
              onClick={handlePlayPause}
              disabled={!canPlay || (audioState.error && isCurrent)}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
                {
                  "bg-[#5e16ea] text-white hover:bg-[#4a11ba]": canPlay && !(audioState.error && isCurrent),
                  "bg-gray-300 text-gray-500 cursor-not-allowed": !canPlay || (audioState.error && isCurrent),
                  "hover:scale-105": canPlay && !(audioState.error && isCurrent),
                  "bg-red-400": audioState.error && isCurrent
                }
              )}
              aria-label={
                !canPlay 
                  ? "Lección bloqueada"
                  : (audioState.error && isCurrent)
                    ? "Error de audio"
                    : (isCurrent && audioState.isPlaying)
                      ? "Pausar" 
                      : "Reproducir"
              }
            >
              {getStatusIcon()}
            </button>
            
            {/* Title */}
            <div>
              <h4 className={cn(
                "font-medium text-sm",
                {
                  "text-[#5e16ea]": isCompleted || (isCurrent && !isCompleted),
                  "text-gray-900": canPlay && !isCurrent && !isCompleted,
                  "text-gray-400": !canPlay,
                  "text-red-600": audioState.error && isCurrent
                }
              )}>
                {lesson.title}
              </h4>
              {isCurrent && audioState.isPlaying && !audioState.error && (
                <span className="text-xs text-green-600">● Reproduciendo</span>
              )}
              {isCurrent && audioState.isLoading && (
                <span className="text-xs text-blue-600">⏳ Cargando...</span>
              )}
              {audioState.error && isCurrent && (
                <span className="text-xs text-red-600">⚠ Error de audio</span>
              )}
            </div>
          </div>

          {/* Duration and Notes */}
          <div className="flex items-center gap-2">
            {/* Notes Icon */}
            {canPlay && courseId && (
              <button
                onClick={handleNotesToggle}
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-full hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md",
                  showNotesPanel 
                    ? "bg-gradient-to-br from-yellow-500 to-orange-600" 
                    : "bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                )}
                aria-label={`Notas (${notes.length})`}
              >
                <span className="text-white text-base">📝</span>
                {notes.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">
                    {notes.length > 9 ? '9+' : notes.length}
                  </span>
                )}
              </button>
            )}
            
            {/* Duration display */}
            <div className={cn(
              "text-xs",
              {
                "text-[#5e16ea]": isCompleted || (isCurrent && !isCompleted),
                "text-gray-600": canPlay && !isCurrent && !isCompleted,
                "text-gray-400": !canPlay
              }
            )}>
              {audioState.formatTime(displayCurrentTime)} / {audioState.formatTime(validDuration)}
            </div>
          </div>
        </div>

        {/* Audio Controls - Only show if can play and no error */}
        {canPlay && !(audioState.error && isCurrent) && (
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="relative">
              <input
                type="range"
                min={0}
                max={validDuration}
                value={displayCurrentTime}
                onChange={handleSeekChange}
                disabled={!isCurrent}
                className={cn(
                  "w-full accent-[#5e16ea] h-1.5 bg-gray-200 rounded-full appearance-none",
                  isCurrent ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                )}
                style={{
                  background: `linear-gradient(to right, #5e16ea 0%, #5e16ea ${(displayCurrentTime / validDuration) * 100}%, #e5e7eb ${(displayCurrentTime / validDuration) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>

            {/* Control Buttons - Only active for current lesson */}
            {isCurrent && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Skip Backward */}
                  <button
                    onClick={handleSkipBackward}
                    className="p-1 text-gray-600 hover:text-[#5e16ea] transition-colors"
                    aria-label="Retroceder 15 segundos"
                  >
                    <SkipBack size={16} />
                  </button>

                  {/* Skip Forward */}
                  <button
                    onClick={handleSkipForward}
                    className="p-1 text-gray-600 hover:text-[#5e16ea] transition-colors"
                    aria-label="Avanzar 15 segundos"
                  >
                    <SkipForward size={16} />
                  </button>

                  {/* Volume Control */}
                  <div className="relative">
                    <button
                      onClick={() => setShowVolumeControl(!showVolumeControl)}
                      className="p-1 text-gray-600 hover:text-[#5e16ea] transition-colors"
                      aria-label={audioState.isMuted ? "Activar sonido" : "Silenciar"}
                    >
                      {audioState.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>

                    {showVolumeControl && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-md shadow-lg p-3 z-10 min-w-32">
                        <div className="flex items-center space-x-2">
                          <button onClick={toggleMute} className="text-gray-600 hover:text-[#5e16ea]">
                            {audioState.isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          </button>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={audioState.volume}
                            onChange={handleVolumeChange}
                            className="flex-1 accent-[#5e16ea] h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Speed Control */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedDropdown(!showSpeedDropdown)}
                    className="flex items-center text-gray-600 hover:text-[#5e16ea] transition-colors px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    <span>{audioState.playbackRate}x</span>
                    <ChevronDown size={12} className="ml-1" />
                  </button>

                  {showSpeedDropdown && (
                    <div className="absolute bottom-full right-0 mb-2 bg-white rounded-md shadow-lg py-1 z-10 min-w-16">
                      {speeds.map(speed => (
                        <button
                          key={speed}
                          onClick={() => handlePlaybackRateChange(speed)}
                          className={cn(
                            "block w-full text-left px-3 py-1 text-xs",
                            speed === audioState.playbackRate 
                              ? "bg-[#5e16ea] bg-opacity-10 text-[#5e16ea]" 
                              : "hover:bg-gray-100"
                          )}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Locked/Error messages */}
        {!canPlay && (
          <div className="text-center py-2">
            <p className="text-xs text-gray-400">
              Completa las lecciones anteriores para desbloquear
            </p>
          </div>
        )}

        {audioState.error && isCurrent && (
          <div className="text-center py-2">
            <p className="text-xs text-red-500">
              Error al cargar el audio. Intenta recargar la página.
            </p>
          </div>
        )}
      </div>

      {/* Notes Panel */}
      {canPlay && courseId && (
        <NotesPanel
          isOpen={showNotesPanel}
          notes={notes}
          onAddNote={handleAddNote}
          onDeleteNote={deleteNote}
          onEditNote={handleEditNote}
          onSeekToTime={handleSeekToNote}
          currentTimeSeconds={displayCurrentTime}
        />
      )}
    </div>
  );
});

LessonCard.displayName = 'LessonCard';

export default LessonCard;
