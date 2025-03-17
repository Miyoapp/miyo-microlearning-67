
import { useState, useRef, useEffect } from 'react';
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
}

const AudioPlayer = ({ lesson, isPlaying, onTogglePlay, onComplete }: AudioPlayerProps) => {
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
    updateTime
  } = useAudioPlayer({ lesson, isPlaying, onTogglePlay, onComplete });
  
  // If no lesson is selected, don't render the player
  if (!lesson) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-player z-40 transition-transform duration-300 animate-slide-up">
      <div className="miyo-container py-4">
        <audio
          ref={audioRef}
          src={lesson.audioUrl || "https://assets.codepen.io/4358584/Anitek_-_Komorebi.mp3"}
          onTimeUpdate={updateTime}
          onLoadedMetadata={handleMetadata}
          onEnded={() => {
            // The audio has naturally ended at 100%, let's proceed to next lesson
            const event = new CustomEvent('lessonEnded', { 
              detail: { lessonId: lesson.id }
            });
            window.dispatchEvent(event);
          }}
        />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <LessonInfo 
              title={lesson.title} 
              currentTime={currentTime} 
              duration={`${lesson.duration}:00`} 
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
              duration={duration || lesson.duration * 60} 
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
