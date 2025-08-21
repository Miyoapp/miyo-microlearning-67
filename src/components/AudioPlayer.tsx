import React from 'react';
import { Lesson } from '../types';
import LessonInfo from './audio/LessonInfo';
import AudioControls from './audio/AudioControls';
import ProgressBar from './audio/ProgressBar';
import VolumeControl from './audio/VolumeControl';
import SpeedControl from './audio/SpeedControl';
import useAudioPlayer from './audio/useAudioPlayer';

interface AudioPlayerProps {
  lesson: Lesson | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onComplete: () => void;
  onAudioComplete?: () => void;
  onProgressUpdate?: (position: number) => void;
  onAudioDataUpdate?: (currentTime: number, duration: number) => void;
  onSeekRequest?: (handler: (value: number) => void) => void;
  onSkipBackwardRequest?: (handler: () => void) => void;
  onSkipForwardRequest?: (handler: () => void) => void;
  onPlaybackRateRequest?: (handler: (rate: number) => void) => void;
}

const AudioPlayer = ({ 
  lesson, 
  isPlaying, 
  onTogglePlay, 
  onComplete,
  onAudioComplete,
  onProgressUpdate,
  onAudioDataUpdate,
  onSeekRequest,
  onSkipBackwardRequest,
  onSkipForwardRequest,
  onPlaybackRateRequest
}: AudioPlayerProps) => {
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
    handleAudioEnded,
    handleSeekFromCard,
    handleSkipBackwardFromCard,
    handleSkipForwardFromCard,
    handlePlaybackRateChangeFromCard
  } = useAudioPlayer({ 
    lesson, 
    isPlaying, 
    onTogglePlay, 
    onComplete, 
    onProgressUpdate,
    onAudioComplete
  });
  
  // Expose audio data to parent components
  React.useEffect(() => {
    if (onAudioDataUpdate) {
      onAudioDataUpdate(currentTime, duration);
    }
  }, [currentTime, duration, onAudioDataUpdate]);
  
  // Expose control handlers to parent components
  React.useEffect(() => {
    if (onSeekRequest) {
      onSeekRequest(handleSeekFromCard);
    }
  }, [onSeekRequest, handleSeekFromCard]);
  
  React.useEffect(() => {
    if (onSkipBackwardRequest) {
      onSkipBackwardRequest(handleSkipBackwardFromCard);
    }
  }, [onSkipBackwardRequest, handleSkipBackwardFromCard]);
  
  React.useEffect(() => {
    if (onSkipForwardRequest) {
      onSkipForwardRequest(handleSkipForwardFromCard);
    }
  }, [onSkipForwardRequest, handleSkipForwardFromCard]);
  
  React.useEffect(() => {
    if (onPlaybackRateRequest) {
      onPlaybackRateRequest(handlePlaybackRateChangeFromCard);
    }
  }, [onPlaybackRateRequest, handlePlaybackRateChangeFromCard]);
  
  // If no lesson is selected, don't render the player
  if (!lesson) {
    console.log('🚫 No lesson selected, not rendering audio player');
    return null;
  }
  
  console.log('🎵 GLOBAL AudioPlayer render for lesson:', lesson.title, 'isPlaying:', isPlaying, 'currentTime:', currentTime, 'duration:', duration);
  
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
            <div className="flex items-center justify-center">
              <AudioControls 
                isPlaying={isPlaying} 
                onPlayPause={onTogglePlay} 
              />
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
    </div>
  );
};

export default AudioPlayer;
