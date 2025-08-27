
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
  
  console.log('🎴 LessonCard Debug:', {
    lessonTitle: lesson.title,
    courseId,
    canPlay,
    isCurrent,
    shouldShowNotes: canPlay && courseId,
    courseIdType: typeof courseId,
    savedProgress
  });
  
  // Notes functionality - Only initialize when courseId exists
  const { notes, addNote, updateNote, deleteNote, fetchNotes } = useNotes(
    canPlay ? lesson.id : undefined, 
    canPlay ? courseId : undefined
  );
  const [showNotesPanel, setShowNotesPanel] = React.useState(false);

  console.log('🎯 LessonCard render:', {
    lessonTitle: lesson.title,
    isCurrent,
    propIsPlaying,
    canPlay,
    isCompleted,
    courseId,
    savedProgress
  });
  
  // Simple inline audio controls state
  const [currentTime, setCurrentTime] = React.useState(savedProgress?.current_position || 0);
  const [duration, setDuration] = React.useState(lesson.duracion || 0);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isAudioReady, setIsAudioReady] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Handle play/pause
  const handlePlayPause = () => {
    console.log('🎵 LessonCard handlePlayPause clicked:', {
      lessonTitle: lesson.title,
      currentIsPlaying: propIsPlaying,
      isCurrent,
      canPlay
    });
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

  // FIXED: Improved audio synchronization with proper error handling
  React.useEffect(() => {
    const syncAudioPlayback = async () => {
      if (!audioRef.current) {
        console.log('🚫 No audioRef available for sync');
        return;
      }

      console.log('🔄 Syncing audio playback:', {
        lessonTitle: lesson.title,
        isCurrent,
        propIsPlaying,
        isAudioReady,
        readyState: audioRef.current.readyState
      });

      try {
        if (isCurrent && propIsPlaying) {
          // Wait for audio to be ready before playing
          if (audioRef.current.readyState >= 2 || isAudioReady) {
            console.log('▶️ Playing audio for:', lesson.title);
            await audioRef.current.play();
          } else {
            console.log('⏳ Audio not ready yet, waiting...');
            // Try again after a short delay
            setTimeout(() => {
              if (audioRef.current && audioRef.current.readyState >= 2) {
                audioRef.current.play().catch(console.error);
              }
            }, 100);
          }
        } else {
          console.log('⏸️ Pausing audio for:', lesson.title);
          audioRef.current.pause();
        }
      } catch (error) {
        console.error('🚨 Audio playback error:', error);
        // Don't break the UI if audio fails
      }
    };

    syncAudioPlayback();
  }, [isCurrent, propIsPlaying, lesson.title, isAudioReady]);

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

  // Simple duration and current time handling for all lessons
  const validDuration = duration || lesson.duracion;
  
  // Always show actual current time
  const validCurrentTime = useMemo(() => {
    return Math.min(currentTime, validDuration);
  }, [currentTime, validDuration]);

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

  // Get status icon based on playing state
  const getStatusIcon = () => {
    if (!canPlay) {
      return <Lock size={16} />;
    }
    if (isCurrent && propIsPlaying) {
      return <Pause size={16} />;
    }
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
        "cursor-not-allowed": !canPlay
      }
    )}>
      {/* Main Card Content */}
      <div className="p-4">
        {/* Audio element for current playing lesson */}
        {isCurrent && (
          <audio
            ref={audioRef}
            src={lesson.urlAudio}
            onLoadedMetadata={handleMetadata}
            onTimeUpdate={updateTime}
            onEnded={handleAudioEnded}
            onCanPlay={() => setIsAudioReady(true)}
            preload="metadata"
          />
        )}
        
        {/* Header with title and status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Functional Status/Play Button */}
            <button
              onClick={handlePlayPause}
              disabled={!canPlay}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
                {
                  "bg-[#5e16ea] text-white hover:bg-[#4a11ba]": canPlay && (isCompleted || !isCompleted),
                  "bg-gray-300 text-gray-500 cursor-not-allowed": !canPlay,
                  "hover:scale-105": canPlay
                }
              )}
              aria-label={
                !canPlay 
                  ? "Lección bloqueada" 
                  : propIsPlaying
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
                  "text-gray-400": !canPlay
                }
              )}>
                {lesson.title}
              </h4>
              {isCurrent && propIsPlaying && (
                <span className="text-xs text-green-600">● Reproduciendo</span>
              )}
            </div>
          </div>

          {/* Duration and Notes Icon */}
          <div className="flex items-center gap-2">
            {/* Notes Icon with Badge */}
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
            
            {/* Duration */}
            <div className={cn(
              "text-xs",
              {
                "text-[#5e16ea]": isCompleted || (isCurrent && !isCompleted),
                "text-gray-600": canPlay && !isCurrent && !isCompleted,
                "text-gray-400": !canPlay
              }
            )}>
              {formatTime(validCurrentTime)} / {formatTime(validDuration)}
            </div>
          </div>
        </div>

        {/* Audio Controls - Only show if can play */}
        {canPlay && (
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="relative">
              <input
                type="range"
                min={0}
                max={validDuration}
                value={validCurrentTime}
                onChange={handleSeekChange}
                className="w-full accent-[#5e16ea] h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #5e16ea 0%, #5e16ea ${(validCurrentTime / validDuration) * 100}%, #e5e7eb ${(validCurrentTime / validDuration) * 100}%, #e5e7eb 100%)`
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
