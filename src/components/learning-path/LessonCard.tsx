
import React from 'react';
import { Lesson } from '@/types';
import { LessonNote } from '@/types/notes';
import { Play, Pause, Lock, SkipBack, SkipForward, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useNotes } from '@/hooks/useNotes';
import NotesPanel from '@/components/notes/NotesPanel';

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
  isPlaying: boolean;
  courseId: string | null;
  savedProgress?: {
    current_position: number;
    is_completed: boolean;
  };
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
}

const LessonCard = React.memo(({ 
  lesson, 
  index, 
  status, 
  isPlaying: propIsPlaying,
  courseId,
  savedProgress,
  onLessonClick,
  onProgressUpdate,
  onLessonComplete
}: LessonCardProps) => {
  const { isCompleted, isLocked, isCurrent, canPlay } = status;
  
  console.log('🎴 LessonCard render:', {
    lessonTitle: lesson.title,
    isCurrent,
    propIsPlaying,
    canPlay,
    isCompleted: savedProgress?.is_completed,
    timestamp: new Date().toLocaleTimeString()
  });
  
  // Notes functionality
  const { notes, addNote, updateNote, deleteNote, fetchNotes } = useNotes(
    canPlay ? lesson.id : undefined, 
    canPlay ? courseId : undefined
  );
  const [showNotesPanel, setShowNotesPanel] = React.useState(false);
  
  // Audio controls state
  const [currentTime, setCurrentTime] = React.useState(savedProgress?.current_position || 0);
  const [duration, setDuration] = React.useState(lesson.duracion || 0);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isAudioReady, setIsAudioReady] = React.useState(false);
  const [audioError, setAudioError] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // DEFINITIVE FIX: Simplified play/pause handler with immediate response
  const handlePlayPause = () => {
    console.log('🎵🎵🎵 DEFINITIVE PLAY/PAUSE CLICK:', {
      lessonTitle: lesson.title,
      currentState: propIsPlaying,
      targetState: !propIsPlaying,
      canPlay,
      timestamp: new Date().toLocaleTimeString()
    });
    
    if (!canPlay) {
      console.log('🚫 Cannot play - lesson is locked');
      return;
    }
    
    // CRITICAL: Call parent with new state immediately
    onLessonClick(lesson, !propIsPlaying);
  };

  // Handle seeking
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Handle skip backward/forward
  const handleSkipBackward = () => {
    const newTime = Math.max(0, currentTime - 15);
    handleSeek(newTime);
  };

  const handleSkipForward = () => {
    const newTime = Math.min(duration, currentTime + 15);
    handleSeek(newTime);
  };

  // Handle playback rate change
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  // Format time display
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle metadata loaded
  const handleMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsAudioReady(true);
      setAudioError(false);
      console.log('🎵 Audio metadata loaded for:', lesson.title);
    }
  };

  // Update time during playback
  const updateTime = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      onProgressUpdate?.(time);
    }
  };

  // Handle audio ended
  const handleAudioEnded = () => {
    onLessonComplete?.();
  };

  // Handle audio error
  const handleAudioError = () => {
    console.error('🚨 Audio error for lesson:', lesson.title);
    setAudioError(true);
    setIsAudioReady(false);
  };

  // DEFINITIVE FIX: Completely rewritten audio sync - simple and robust
  React.useEffect(() => {
    console.log('🔄 SIMPLIFIED AUDIO SYNC:', {
      lessonTitle: lesson.title,
      isCurrent,
      shouldPlay: propIsPlaying,
      hasAudio: !!audioRef.current,
      isReady: isAudioReady,
      hasError: audioError
    });

    // Only sync if this is the current lesson and we have audio
    if (!isCurrent || !audioRef.current || audioError) {
      return;
    }

    const audio = audioRef.current;
    
    // SIMPLIFIED: Direct sync without complex promises or timeouts
    if (propIsPlaying && audio.paused) {
      console.log('▶️ STARTING PLAYBACK (simplified)');
      audio.play().catch(error => {
        console.error('🚨 Play failed:', error);
        setAudioError(true);
        // Update parent state to reflect reality
        onLessonClick(lesson, false);
      });
    } else if (!propIsPlaying && !audio.paused) {
      console.log('⏸️ PAUSING PLAYBACK (simplified)');
      audio.pause();
    }
  }, [isCurrent, propIsPlaying, lesson.id, audioError, isAudioReady]);

  // Fetch notes when lesson can play and courseId is available
  React.useEffect(() => {
    if (canPlay && courseId) {
      fetchNotes();
    }
  }, [canPlay, courseId, fetchNotes]);

  // Handle adding note
  const handleAddNote = async (noteText: string) => {
    await addNote(noteText, currentTime);
  };

  // Handle editing note
  const handleEditNote = async (noteId: string, updates: Partial<Pick<LessonNote, 'note_text' | 'note_title' | 'tags' | 'is_favorite'>>) => {
    await updateNote(noteId, updates);
  };

  // Handle seeking to note time
  const handleSeekToNote = (timeInSeconds: number) => {
    handleSeek(timeInSeconds);
  };

  // Handle notes panel toggle
  const handleNotesToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotesPanel(!showNotesPanel);
  };

  // Speed options for dropdown
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const [showSpeedDropdown, setShowSpeedDropdown] = React.useState(false);
  const [showVolumeControl, setShowVolumeControl] = React.useState(false);

  // DEFINITIVE FIX: Progress display logic for completed vs active lessons
  const validDuration = duration || lesson.duracion;
  
  // CRITICAL FIX: Show proper progress for completed lessons
  const displayCurrentTime = useMemo(() => {
    // If lesson is completed, always show full duration
    if (savedProgress?.is_completed) {
      console.log('📊 Completed lesson - showing full duration:', lesson.title);
      return validDuration;
    }
    
    // For active/incomplete lessons, show actual current time
    const actualTime = Math.min(currentTime, validDuration);
    console.log('📊 Active lesson - showing current time:', lesson.title, actualTime);
    return actualTime;
  }, [currentTime, validDuration, savedProgress?.is_completed, lesson.title]);

  // Handle seek change
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    handleSeek(value);
  };

  // Handle playback rate change from dropdown
  const handleRateChange = (rate: number) => {
    handlePlaybackRateChange(rate);
    setShowSpeedDropdown(false);
  };

  // DEFINITIVE: Clear status icon logic
  const getStatusIcon = () => {
    if (!canPlay) {
      return <Lock size={16} />;
    }
    
    // Show pause icon ONLY if this lesson is current AND global state is playing
    if (isCurrent && propIsPlaying && !audioError) {
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
        "border-red-200 bg-red-50": audioError && isCurrent
      }
    )}>
      {/* Main Card Content - COMPACTO: Reducir padding */}
      <div className="p-3 sm:p-4">
        {/* Audio element for current playing lesson */}
        {isCurrent && (
          <audio
            ref={audioRef}
            src={lesson.urlAudio}
            onLoadedMetadata={handleMetadata}
            onTimeUpdate={updateTime}
            onEnded={handleAudioEnded}
            onCanPlay={() => setIsAudioReady(true)}
            onError={handleAudioError}
            preload="metadata"
          />
        )}
        
        {/* Header with title and status - COMPACTO: Reducir margen */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-3">
            {/* DEFINITIVE: Functional Status/Play Button - COMPACTO: Reducir tamaño en mobile */}
            <button
              onClick={handlePlayPause}
              disabled={!canPlay || audioError}
              className={cn(
                "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-200",
                {
                  "bg-[#5e16ea] text-white hover:bg-[#4a11ba]": canPlay && !audioError,
                  "bg-gray-300 text-gray-500 cursor-not-allowed": !canPlay || audioError,
                  "hover:scale-105": canPlay && !audioError,
                  "bg-red-400": audioError && isCurrent
                }
              )}
              aria-label={
                !canPlay 
                  ? "Lección bloqueada"
                  : audioError
                    ? "Error de audio"
                    : (isCurrent && propIsPlaying)
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
                  "text-red-600": audioError && isCurrent
                }
              )}>
                {lesson.title}
              </h4>
              {isCurrent && propIsPlaying && !audioError && (
                <span className="text-xs text-green-600">● Reproduciendo</span>
              )}
              {audioError && isCurrent && (
                <span className="text-xs text-red-600">⚠ Error de audio</span>
              )}
            </div>
          </div>

          {/* Duration and Notes Icon */}
          <div className="flex items-center gap-2">
            {/* Notes Icon with Badge - COMPACTO: Reducir tamaño en mobile */}
            {canPlay && courseId && (
              <button
                onClick={handleNotesToggle}
                className={cn(
                  "relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md",
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
            
            {/* DEFINITIVE FIX: Duration display with proper completed lesson handling */}
            <div className={cn(
              "text-xs",
              {
                "text-[#5e16ea]": isCompleted || (isCurrent && !isCompleted),
                "text-gray-600": canPlay && !isCurrent && !isCompleted,
                "text-gray-400": !canPlay
              }
            )}>
              {formatTime(displayCurrentTime)} / {formatTime(validDuration)}
            </div>
          </div>
        </div>

        {/* Audio Controls - Only show if can play and no error - COMPACTO: Reducir espaciado */}
        {canPlay && !audioError && (
          <div className="space-y-2 sm:space-y-3">
            {/* Progress Bar */}
            <div className="relative">
              <input
                type="range"
                min={0}
                max={validDuration}
                value={displayCurrentTime}
                onChange={handleSeekChange}
                className="w-full accent-[#5e16ea] h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #5e16ea 0%, #5e16ea ${(displayCurrentTime / validDuration) * 100}%, #e5e7eb ${(displayCurrentTime / validDuration) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>

            {/* Control Buttons */}
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
                    aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>

                  {showVolumeControl && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-md shadow-lg p-3 z-10 min-w-32">
                      <div className="flex items-center space-x-2">
                        <button onClick={toggleMute} className="text-gray-600 hover:text-[#5e16ea]">
                          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={volume}
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
                  <span>{playbackRate}x</span>
                  <ChevronDown size={12} className="ml-1" />
                </button>

                {showSpeedDropdown && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white rounded-md shadow-lg py-1 z-10 min-w-16">
                    {speeds.map(speed => (
                      <button
                        key={speed}
                        onClick={() => handleRateChange(speed)}
                        className={cn(
                          "block w-full text-left px-3 py-1 text-xs",
                          speed === playbackRate 
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
          </div>
        )}

        {/* Locked message */}
        {!canPlay && (
          <div className="text-center py-2">
            <p className="text-xs text-gray-400">
              Completa las lecciones anteriores para desbloquear
            </p>
          </div>
        )}

        {/* Audio error message */}
        {audioError && isCurrent && (
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
          currentTimeSeconds={currentTime}
        />
      )}
    </div>
  );
});

LessonCard.displayName = 'LessonCard';

export default LessonCard;
