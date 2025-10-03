
import React from 'react';
import { Lesson } from '@/types';
import { LessonNote } from '@/types/notes';
import { Play, Pause, Lock, SkipBack, SkipForward, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useNotes } from '@/hooks/useNotes';
import NotesPanel from '@/components/notes/NotesPanel';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

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
}

const LessonCard = React.memo(({ 
  lesson, 
  index, 
  status, 
  isPlaying: propIsPlaying,
  courseId,
  savedProgress,
  onLessonClick
}: LessonCardProps) => {
  const { isCompleted, isLocked, isCurrent, canPlay } = status;
  
  // Audio player state
  const { 
    currentLesson, 
    currentTime, 
    duration, 
    volume, 
    playbackRate, 
    isMuted, 
    hasError,
    togglePlay,
    seekTo, 
    skipForward, 
    skipBackward, 
    setVolume, 
    setPlaybackRate, 
    toggleMute,
    isProviderReady: isAudioReady
  } = useAudioPlayer();

  // Guard: Don't render if audio provider is not ready
  if (!isAudioReady) {
    console.debug('⏳ LessonCard: AudioProvider not ready for lesson:', lesson.title);
    return (
      <div className="bg-gray-100 rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }
  
  console.debug('🎴 LessonCard render:', {
    lessonTitle: lesson.title,
    isCurrent,
    propIsPlaying,
    canPlay,
    isCompleted: savedProgress?.is_completed,
    isAudioReady,
    timestamp: new Date().toLocaleTimeString()
  });
  
  // Notes functionality
  const { notes, addNote, updateNote, deleteNote, fetchNotes } = useNotes(
    canPlay ? lesson.id : undefined, 
    canPlay ? courseId : undefined
  );
  const [showNotesPanel, setShowNotesPanel] = React.useState(false);
  
  // Audio controls state for UI only
  const [showSpeedDropdown, setShowSpeedDropdown] = React.useState(false);
  const [showVolumeControl, setShowVolumeControl] = React.useState(false);

  // Local state to handle immediate completion visual feedback
  const [justCompleted, setJustCompleted] = React.useState(false);
  
  // State for temporary progress during replay of completed lessons
  const [temporaryPosition, setTemporaryPosition] = React.useState<number | null>(null);

  // Play/pause handler - FIXED condition check
  const handlePlayPause = () => {
    const isCurrentLesson = currentLesson && currentLesson.id === lesson.id;
    
    console.log('🎵 LessonCard - Play/Pause click:', {
      lessonTitle: lesson.title,
      isCurrent,
      isCurrentLesson,
      currentLessonId: currentLesson?.id,
      thisLessonId: lesson.id,
      currentState: propIsPlaying,
      canPlay,
      timestamp: new Date().toLocaleTimeString()
    });
    
    if (!canPlay) {
      console.log('🚫 Cannot play - lesson is locked');
      return;
    }
    
    // FIXED: Use exact ID comparison for current lesson check
    if (isCurrentLesson) {
      console.log('🎵 TOGGLE PLAY - Current lesson confirmed');
      togglePlay();
    } else {
      console.log('🎵 SELECT NEW - Different lesson');
      onLessonClick(lesson, true);
    }
  };

  // Handle seeking - only if this is current lesson
  const handleSeek = (time: number) => {
    if (isCurrent) {
      seekTo(time);
    }
  };

  // Handle skip backward/forward - only if this is current lesson
  const handleSkipBackward = () => {
    if (isCurrent) {
      skipBackward(15);
    }
  };

  const handleSkipForward = () => {
    if (isCurrent) {
      skipForward(15);
    }
  };

  // Handle playback rate change - only if this is current lesson
  const handlePlaybackRateChange = (rate: number) => {
    if (isCurrent) {
      setPlaybackRate(rate);
    }
    setShowSpeedDropdown(false);
  };

  // Handle volume change - global setting
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  // Format time display
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Progress display logic - moved here before useEffect that needs it
  // Fix for mobile: Ensure completed lessons always have valid duration
  const validDuration = useMemo(() => {
    if (isCurrent && currentLesson?.id === lesson.id) {
      return duration;
    }
    
    // For completed lessons, ensure we have a valid duration
    if (savedProgress?.is_completed && (lesson.duracion || 0) === 0) {
      // If lesson duration is 0 but it's completed, use saved progress position as duration
      return savedProgress.current_position || lesson.duracion || 1;
    }
    
    return lesson.duracion || 0;
  }, [isCurrent, currentLesson?.id, lesson.id, duration, lesson.duracion, savedProgress?.is_completed, savedProgress?.current_position]);

  // Fetch notes when lesson can play and courseId is available
  React.useEffect(() => {
    if (canPlay && courseId) {
      fetchNotes();
    }
  }, [canPlay, courseId, fetchNotes]);

  // Handle lesson completion feedback - improved immediate sync
  React.useEffect(() => {
    // If this lesson just got completed and we're the current lesson at the end
    if (isCurrent && currentTime >= validDuration * 0.98 && validDuration > 0 && !savedProgress?.is_completed) {
      console.log('🏁 LessonCard: Detected lesson completion, setting justCompleted');
      setJustCompleted(true);
      
      // Reset after a delay to allow database sync
      setTimeout(() => {
        setJustCompleted(false);
      }, 5000); // Keep for longer to ensure sync
    }
    
    // Clear justCompleted if lesson becomes completed in DB
    if (savedProgress?.is_completed && justCompleted) {
      console.log('✅ LessonCard: DB shows completed, clearing justCompleted state');
      setTimeout(() => setJustCompleted(false), 1000);
    }
  }, [isCurrent, currentTime, validDuration, savedProgress?.is_completed, justCompleted]);

  // Reset justCompleted when saved progress gets updated to completed
  React.useEffect(() => {
    if (savedProgress?.is_completed && justCompleted) {
      console.log('🔄 LessonCard: Database sync complete, resetting justCompleted');
      setJustCompleted(false);
    }
  }, [savedProgress?.is_completed, justCompleted]);
  
  // Update temporary position during playback (both completed and non-completed lessons)
  React.useEffect(() => {
    if (isCurrent && propIsPlaying && validDuration > 0) {
      console.log('🎯 Updating temporaryPosition for current lesson:', currentTime);
      setTemporaryPosition(Math.min(currentTime, validDuration));
    }
    
    // When pausing a non-completed lesson, save the current position
    if (isCurrent && !propIsPlaying && !savedProgress?.is_completed && currentTime > 0) {
      console.log('⏸️ Saving temporaryPosition for paused non-completed lesson:', currentTime);
      setTemporaryPosition(Math.min(currentTime, validDuration));
    }
  }, [isCurrent, propIsPlaying, currentTime, validDuration, savedProgress?.is_completed]);
  
  // Reset temporary position when lesson changes or becomes inactive
  React.useEffect(() => {
    // Reset temporaryPosition when:
    // 1. Lesson is no longer current
    // 2. Current lesson ID changes 
    if (!isCurrent || (currentLesson && currentLesson.id !== lesson.id)) {
      if (temporaryPosition !== null) {
        console.log('🔄 Resetting temporaryPosition - lesson changed');
        setTemporaryPosition(null);
      }
    }
  }, [isCurrent, currentLesson?.id, lesson.id, temporaryPosition]);

  // Handle adding note
  const handleAddNote = async (noteText: string) => {
    const timeForNote = isCurrent ? currentTime : 0;
    await addNote(noteText, timeForNote);
  };

  // Handle editing note
  const handleEditNote = async (noteId: string, updates: Partial<Pick<LessonNote, 'note_text' | 'tags' | 'is_favorite'>>) => {
    await updateNote(noteId, updates);
  };

  // Handle seeking to note time
  const handleSeekToNote = (timeInSeconds: number) => {
    if (isCurrent) {
      handleSeek(timeInSeconds);
    }
  };

  // Handle notes panel toggle
  const handleNotesToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotesPanel(!showNotesPanel);
  };

  // Speed options for dropdown
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  
  // TEMPORAL PROGRESS display current time - handles completed lesson replay
  const displayCurrentTime = useMemo(() => {
    console.log('📊 DisplayCurrentTime - TEMPORAL PROGRESS:', {
      lessonId: lesson.id,
      isCompleted: savedProgress?.is_completed,
      currentPosition: savedProgress?.current_position,
      isCurrent,
      propIsPlaying,
      currentTime,
      temporaryPosition,
      validDuration
    });
    
    // FOR COMPLETED LESSONS: Handle temporary replay progress
    if (savedProgress?.is_completed) {
      // If currently playing: show real-time progress
      if (isCurrent && propIsPlaying) {
        const realTime = Math.min(currentTime, validDuration);
        console.log('📊 COMPLETED PLAYING - showing real-time:', realTime);
        return realTime;
      }
      
      // If paused: show temporary position (maintains pause position)
      if (isCurrent && !propIsPlaying && temporaryPosition !== null) {
        console.log('📊 COMPLETED PAUSED - showing temporaryPosition:', temporaryPosition);
        return temporaryPosition;
      }
      
      // If not current: show 100% from DB (completed state)
      // Fix: Use saved current_position if validDuration is 0, otherwise use validDuration
      const completedPosition = validDuration > 0 ? validDuration : (savedProgress.current_position || 1);
      console.log('📊 COMPLETED INACTIVE - showing 100%:', completedPosition);
      return completedPosition;
    }
    
    // FOR NON-COMPLETED LESSONS: Enhanced logic with pause support
    // If this is the current lesson playing, show real-time
    if (isCurrent && currentLesson?.id === lesson.id && propIsPlaying) {
      const realTime = Math.min(currentTime, validDuration);
      console.log('📊 NON-COMPLETED PLAYING - showing real-time:', realTime);
      return realTime;
    }
    
    // If paused: show temporary position (maintains pause position)
    if (isCurrent && !propIsPlaying && temporaryPosition !== null) {
      console.log('📊 NON-COMPLETED PAUSED - showing temporaryPosition:', temporaryPosition);
      return temporaryPosition;
    }
    
    // Otherwise, use saved progress
    const savedPos = savedProgress?.current_position || 0;
    console.log('📊 NON-COMPLETED SAVED - showing saved position:', savedPos);
    return savedPos;
  }, [savedProgress?.is_completed, savedProgress?.current_position, isCurrent, currentLesson?.id, propIsPlaying, currentTime, validDuration, lesson.id, temporaryPosition]);

  // Handle seek change
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    handleSeek(value);
  };

  // Status icon logic
  const getStatusIcon = () => {
    if (!canPlay && !isCompleted) {
      return <Lock size={16} />;
    }
    
    if (isCurrent && propIsPlaying && !hasError) {
      return <Pause size={16} />;
    }
    
    return <Play size={16} fill="white" />;
  };

  return (
    <div className={cn(
      "bg-white rounded-lg border shadow-sm transition-all duration-200",
      {
        "border-[#5e16ea] shadow-md": isCompleted || isCurrent,
        "border-gray-200": !isCurrent && !isCompleted && canPlay,
        "border-gray-100 bg-gray-50": !canPlay,
        "hover:shadow-md": canPlay,
        "cursor-not-allowed": !canPlay,
        "border-red-200 bg-red-50": hasError && isCurrent
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
              disabled={!canPlay || (hasError && isCurrent)}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
                {
                  "bg-[#5e16ea] text-white hover:bg-[#4a11ba]": canPlay && !(hasError && isCurrent),
                  "bg-gray-300 text-gray-500 cursor-not-allowed": !canPlay || (hasError && isCurrent),
                  "hover:scale-105": canPlay && !(hasError && isCurrent),
                  "bg-red-400": hasError && isCurrent
                }
              )}
              aria-label={
                !canPlay 
                  ? "Lección bloqueada"
                  : (hasError && isCurrent)
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
                  "text-[#5e16ea]": isCompleted || isCurrent,
                  "text-gray-900": canPlay && !isCurrent && !isCompleted,
                  "text-gray-400": !canPlay,
                  "text-red-600": hasError && isCurrent
                }
              )}>
                {lesson.title}
              </h4>
              {isCurrent && propIsPlaying && !(hasError && isCurrent) && (
                <span className="text-xs text-green-600">● Reproduciendo</span>
              )}
              {hasError && isCurrent && (
                <span className="text-xs text-red-600">⚠ Error de audio</span>
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
            
            {/* Duration display */}
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

        {/* Audio Controls - Only show if can play and no error */}
        {(canPlay || isCompleted) && !(hasError && isCurrent) && (
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="relative">
              <input
                type="range"
                min={0}
                max={validDuration}
                value={displayCurrentTime}
                onChange={handleSeekChange}
                disabled={!isCurrent} // Only allow seeking on current lesson
                className="w-full accent-[#5e16ea] h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, #5e16ea 0%, #5e16ea ${(displayCurrentTime / validDuration) * 100}%, #e5e7eb ${(displayCurrentTime / validDuration) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>

            {/* Control Buttons - Only show for current lesson */}
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
                          onClick={() => handlePlaybackRateChange(speed)}
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
            )}
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
        {hasError && isCurrent && (
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
          currentTimeSeconds={isCurrent ? currentTime : 0}
        />
      )}
    </div>
  );
});

LessonCard.displayName = 'LessonCard';

export default LessonCard;
