import React from 'react';
import { Lesson } from '@/types';
import { Play, Pause, Lock, SkipBack, SkipForward, ChevronDown, Volume2, VolumeX, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLessonCard } from '@/hooks/learning-path/useLessonCard';
import { useMemo } from 'react';
import { useNotes } from '@/hooks/useNotes';
import AddNoteModal from '@/components/notes/AddNoteModal';
import NotesListSection from '@/components/notes/NotesListSection';

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
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
}

const LessonCard = React.memo(({ 
  lesson, 
  index, 
  status, 
  isPlaying: propIsPlaying,
  onLessonClick,
  onProgressUpdate,
  onLessonComplete
}: LessonCardProps) => {
  const { isCompleted, isLocked, isCurrent, canPlay } = status;
  
  // Notes functionality
  const { notes, addNote, updateNote, deleteNote, fetchNotes } = useNotes(
    isCurrent ? lesson.id : undefined, 
    isCurrent ? 'course-id-placeholder' : undefined // We'll need to pass courseId properly
  );
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = React.useState(false);

  console.log('🎯 LessonCard render:', {
    lessonTitle: lesson.title,
    isCurrent,
    propIsPlaying,
    canPlay,
    isCompleted
  });
  
  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    handlePlayPause,
    handleSeek,
    handleSkipBackward,
    handleSkipForward,
    handlePlaybackRateChange,
    handleVolumeChange,
    toggleMute,
    formatTime,
    audioRef,
    handleMetadata,
    updateTime,
    handleAudioEnded
  } = useLessonCard({
    lesson,
    canPlay,
    isCurrent,
    isPlaying: propIsPlaying,
    onLessonClick,
    onProgressUpdate,
    onLessonComplete
  });

  // Fetch notes when lesson becomes current
  React.useEffect(() => {
    if (isCurrent) {
      fetchNotes();
    }
  }, [isCurrent, fetchNotes]);

  // Handle adding note
  const handleAddNote = async (noteText: string) => {
    await addNote(noteText, currentTime);
  };

  // Handle seeking to note time
  const handleSeekToNote = (timeInSeconds: number) => {
    handleSeek(timeInSeconds);
  };

  // Speed options for dropdown
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const [showSpeedDropdown, setShowSpeedDropdown] = React.useState(false);
  const [showVolumeControl, setShowVolumeControl] = React.useState(false);

  const validDuration = duration || (lesson.duracion * 60);
  
  // Always show real progress - no special cases
  const validCurrentTime = useMemo(() => {
    return Math.min(currentTime, validDuration);
  }, [currentTime, validDuration]);

  // Handle seek
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    handleSeek(value);
  };

  // Handle playback rate change
  const handleRateChange = (rate: number) => {
    handlePlaybackRateChange(rate);
    setShowSpeedDropdown(false);
  };

  // Always show play/pause icon, never trophy
  const getStatusIcon = () => {
    if (!canPlay) {
      return <Lock size={16} />;
    }
    if (isCurrent && isPlaying) {
      return <Pause size={16} />;
    }
    return <Play size={16} fill="white" />;
  };

  return (
    <>
      <div className={cn(
        "bg-white rounded-lg border shadow-sm p-4 transition-all duration-200",
        {
          "border-[#5e16ea] shadow-md": isCompleted || (isCurrent && !isCompleted),
          "border-gray-200": !isCurrent && !isCompleted && canPlay,
          "border-gray-100 bg-gray-50": !canPlay,
          "hover:shadow-md": canPlay,
          "cursor-not-allowed": !canPlay
        }
      )}>
        {/* Audio element for current playing lesson */}
        {audioRef && (
          <audio
            ref={audioRef}
            src={lesson.urlAudio}
            onLoadedMetadata={handleMetadata}
            onTimeUpdate={updateTime}
            onEnded={handleAudioEnded}
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
                  : isPlaying
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
              {isCurrent && isPlaying && (
                <span className="text-xs text-green-600">● Reproduciendo</span>
              )}
            </div>
          </div>

          {/* Duration and Notes Icon */}
          <div className="flex items-center gap-2">
            {/* Notes Icon - Only show when current and can play */}
            {isCurrent && canPlay && (
              <button
                onClick={() => setIsAddNoteModalOpen(true)}
                className="p-1 text-gray-600 hover:text-[#5e16ea] transition-colors"
                aria-label="Agregar nota"
              >
                <PenTool size={16} />
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

        {/* Notes List - Only show for current lesson if there are notes */}
        {isCurrent && canPlay && notes.length > 0 && (
          <NotesListSection
            notes={notes}
            onDeleteNote={deleteNote}
            onEditNote={updateNote}
            onSeekToTime={handleSeekToNote}
          />
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

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        onSave={handleAddNote}
        currentTimeSeconds={currentTime}
      />
    </>
  );
});

LessonCard.displayName = 'LessonCard';

export default LessonCard;
