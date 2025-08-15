
import { Lesson } from '../types';
import LessonInfo from './audio/LessonInfo';
import AudioControls from './audio/AudioControls';
import ProgressBar from './audio/ProgressBar';
import VolumeControl from './audio/VolumeControl';
import SpeedControl from './audio/SpeedControl';
import AddNoteModal from './audio/AddNoteModal';
import NotesList from './audio/NotesList';
import useAudioPlayer from './audio/useAudioPlayer';
import { useAudioNotes } from '@/hooks/useAudioNotes';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StickyNote, List } from 'lucide-react';

interface AudioPlayerProps {
  lesson: Lesson | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onComplete: () => void;
  onProgressUpdate?: (position: number) => void;
  courseId?: string;
}

const AudioPlayer = ({ lesson, isPlaying, onTogglePlay, onComplete, onProgressUpdate, courseId }: AudioPlayerProps) => {
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showNotesListModal, setShowNotesListModal] = useState(false);
  
  const {
    audioRef,
    currentTime,
    duration,
    isMuted,
    volume,
    playbackRate,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    handlePlaybackRateChange,
    handleMetadata,
    updateTime,
    handleAudioEnded
  } = useAudioPlayer({ lesson, isPlaying, onTogglePlay, onComplete, onProgressUpdate });

  const {
    notes,
    loading: notesLoading,
    addNote,
    updateNote,
    deleteNote
  } = useAudioNotes(lesson?.id || null, courseId || null);
  
  // If no lesson is selected, don't render the player
  if (!lesson) {
    console.log('🚫 No lesson selected, not rendering audio player');
    return null;
  }
  
  console.log('🎵 Rendering AudioPlayer for lesson:', lesson.title, 'isPlaying:', isPlaying);

  const handleAddNote = async (noteText: string) => {
    await addNote(noteText, currentTime);
  };

  const handleJumpToTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      handleSeek(seconds);
    }
    setShowNotesListModal(false);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-player z-40 transition-transform duration-150 animate-slide-up">
      <div className="miyo-container py-4">
        <audio
          ref={audioRef}
          src={lesson.urlAudio}
          onTimeUpdate={updateTime}
          onLoadedMetadata={handleMetadata}
          onEnded={handleAudioEnded}
          preload="metadata"
        />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <LessonInfo 
              title={lesson.title} 
              currentTime={currentTime} 
              duration={duration || lesson.duracion} 
            />
          </div>
          
          <div className="flex-1 mx-0 md:mx-6">
            <div className="flex items-center justify-center space-x-4">
              <AudioControls 
                isPlaying={isPlaying} 
                onPlayPause={onTogglePlay} 
              />
              
              {/* Botones de notas */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddNoteModal(true)}
                  className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  title="Agregar nota"
                >
                  <StickyNote className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotesListModal(true)}
                  className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 relative"
                  title="Ver notas"
                >
                  <List className="h-4 w-4" />
                  {notes.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {notes.length}
                    </span>
                  )}
                </Button>
              </div>
              
              <div className="ml-4">
                <SpeedControl 
                  playbackRate={playbackRate}
                  onPlaybackRateChange={handlePlaybackRateChange}
                />
              </div>
            </div>
            
            <ProgressBar 
              currentTime={currentTime} 
              duration={duration || (lesson.duracion * 60)} 
              onSeek={handleSeek} 
            />
          </div>
          
          <div className="flex items-center mt-3 md:mt-0">
            <VolumeControl 
              volume={volume} 
              isMuted={isMuted} 
              onVolumeChange={handleVolumeChange} 
              onToggleMute={toggleMute} 
            />
          </div>
        </div>
      </div>

      {/* Modales de notas */}
      <AddNoteModal
        isOpen={showAddNoteModal}
        onClose={() => setShowAddNoteModal(false)}
        onSave={handleAddNote}
        currentTime={currentTime}
        isLoading={notesLoading}
      />

      <NotesList
        isOpen={showNotesListModal}
        onClose={() => setShowNotesListModal(false)}
        notes={notes}
        onJumpToTime={handleJumpToTime}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
        isLoading={notesLoading}
      />
    </div>
  );
};

export default AudioPlayer;
