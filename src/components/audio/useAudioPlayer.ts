
import { useState, useRef, useEffect, useCallback } from 'react';
import { Lesson } from '../../types';

interface UseAudioPlayerProps {
  lesson: Lesson | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onComplete: () => void;
  onProgressUpdate?: (position: number) => void;
  savedProgress?: { current_position: number; is_completed: boolean } | null;
}

const useAudioPlayer = ({ 
  lesson, 
  isPlaying, 
  onTogglePlay, 
  onComplete, 
  onProgressUpdate,
  savedProgress 
}: UseAudioPlayerProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasInitialized, setHasInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  console.log('🎵 useAudioPlayer - GLOBAL AUDIO CONTROLLER:', {
    lessonTitle: lesson?.title || 'None',
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    savedProgress
  });
  
  // Reset player when lesson changes
  useEffect(() => {
    if (lesson && audioRef.current) {
      console.log("🎵 Lesson changed to:", lesson.title, "isCompleted:", lesson.isCompleted);
      setCurrentTime(0);
      setDuration(0);
      setHasInitialized(false);
      
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.load();
      
      // Set initial properties
      audio.volume = isMuted ? 0 : volume;
      audio.playbackRate = playbackRate;
    }
  }, [lesson?.id, volume, isMuted]);
  
  // Handle playback rate changes separately
  useEffect(() => {
    if (audioRef.current) {
      console.log("🏃‍♂️ Updating playback rate to:", playbackRate + "x");
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);
  
  // Handle volume and mute changes separately
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  // Handle play/pause when isPlaying state changes
  useEffect(() => {
    if (!audioRef.current || !lesson) return;
    
    const audio = audioRef.current;
    
    if (isPlaying) {
      console.log("▶️ GLOBAL AUDIO: Playing audio for lesson:", lesson.title);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("❌ Audio playback failed:", error);
          onTogglePlay();
        });
      }
    } else {
      console.log("⏸️ GLOBAL AUDIO: Pausing audio");
      audio.pause();
    }
  }, [isPlaying, lesson?.id, onTogglePlay]);
  
  // 🔧 CORRECCIÓN 1: Update time display SIEMPRE (comportamiento Spotify)
  const updateTime = useCallback(() => {
    if (audioRef.current && duration > 0) {
      const newCurrentTime = audioRef.current.currentTime;
      setCurrentTime(newCurrentTime);
      
      // 🎯 CAMBIO CLAVE: SIEMPRE actualizar progreso visual, sin condiciones
      // La barra debe mostrar progreso real como cualquier reproductor
      if (onProgressUpdate) {
        const progressPercent = (newCurrentTime / duration) * 100;
        console.log('📊 Updating visual progress for lesson:', lesson?.title, 'progress:', progressPercent.toFixed(1) + '%');
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, lesson, onProgressUpdate]);
  
  // 🔧 CORRECCIÓN 2: Handle metadata loaded con inicialización correcta
  const handleMetadata = useCallback(() => {
    if (audioRef.current && !hasInitialized) {
      const newDuration = audioRef.current.duration;
      console.log("📋 Audio metadata loaded, duration:", newDuration);
      setDuration(newDuration);
      
      // 🎯 INICIALIZACIÓN CORRECTA basada en savedProgress
      if (savedProgress) {
        if (savedProgress.is_completed) {
          // ✅ Lecciones completadas: inicializar en 100%
          console.log("🏆 Lección completada, inicializando en 100%");
          const finalTime = newDuration;
          setCurrentTime(finalTime);
          audioRef.current.currentTime = finalTime;
          
          // Actualizar progreso visual inmediatamente
          if (onProgressUpdate) {
            onProgressUpdate(100);
          }
        } else if (savedProgress.current_position > 0) {
          // ⏯️ Lecciones incompletas: restaurar progreso guardado
          const savedTime = (savedProgress.current_position / 100) * newDuration;
          console.log("📍 Restaurando progreso guardado:", savedTime, "segundos");
          setCurrentTime(savedTime);
          audioRef.current.currentTime = savedTime;
          
          // Actualizar progreso visual inmediatamente
          if (onProgressUpdate) {
            onProgressUpdate(savedProgress.current_position);
          }
        } else {
          // 🆕 Lecciones nuevas: iniciar en 0%
          console.log("🆕 Lección nueva, iniciando en 0%");
          setCurrentTime(0);
          audioRef.current.currentTime = 0;
          if (onProgressUpdate) {
            onProgressUpdate(0);
          }
        }
      } else {
        // Sin datos guardados: iniciar en 0%
        setCurrentTime(0);
        audioRef.current.currentTime = 0;
        if (onProgressUpdate) {
          onProgressUpdate(0);
        }
      }
      
      setHasInitialized(true);
    }
  }, [savedProgress, onProgressUpdate, hasInitialized]);
  
  // Handle audio ended
  const handleAudioEnded = useCallback(() => {
    if (lesson) {
      console.log("🏁 Audio ended for lesson:", lesson.title);
      // 🎯 COMPORTAMIENTO SPOTIFY: Al terminar, ir al final
      setCurrentTime(duration);
      onComplete();
    }
  }, [lesson, duration, onComplete]);
  
  // 🔧 CORRECCIÓN 3: Handle seek SIEMPRE actualiza progreso
  const handleSeekFromCard = useCallback((value: number) => {
    if (audioRef.current) {
      console.log('🎯 GLOBAL AUDIO: Seek from card to position:', value);
      setCurrentTime(value);
      audioRef.current.currentTime = value;
      
      // 🎯 SIEMPRE actualizar progreso visual cuando se hace seek
      if (onProgressUpdate && duration > 0) {
        const progressPercent = (value / duration) * 100;
        console.log('🎯 Seek: Updating visual progress:', progressPercent.toFixed(1) + '%');
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, onProgressUpdate]);
  
  // Handle skip backward
  const handleSkipBackwardFromCard = useCallback(() => {
    if (audioRef.current) {
      console.log('⏪ GLOBAL AUDIO: Skip backward from card');
      const newTime = Math.max(0, audioRef.current.currentTime - 15);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Actualizar progreso visual
      if (onProgressUpdate && duration > 0) {
        const progressPercent = (newTime / duration) * 100;
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, onProgressUpdate]);
  
  // Handle skip forward
  const handleSkipForwardFromCard = useCallback(() => {
    if (audioRef.current) {
      console.log('⏩ GLOBAL AUDIO: Skip forward from card');
      const newTime = Math.min(duration, audioRef.current.currentTime + 15);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Actualizar progreso visual
      if (onProgressUpdate && duration > 0) {
        const progressPercent = (newTime / duration) * 100;
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, onProgressUpdate]);
  
  // Handle playback rate change from lesson cards
  const handlePlaybackRateChangeFromCard = useCallback((rate: number) => {
    console.log("🎛️ GLOBAL AUDIO: Speed control from card - Changing playback rate to", rate + "x");
    setPlaybackRate(rate);
  }, []);
  
  // 🔧 CORRECCIÓN 4: Handle seek SIEMPRE funciona igual
  const handleSeek = useCallback((value: number) => {
    if (audioRef.current) {
      setCurrentTime(value);
      audioRef.current.currentTime = value;
      
      // 🎯 SIEMPRE actualizar progreso visual
      if (onProgressUpdate && duration > 0) {
        const progressPercent = (value / duration) * 100;
        console.log('🎯 Direct seek: Updating visual progress:', progressPercent.toFixed(1) + '%');
        onProgressUpdate(progressPercent);
      }
    }
  }, [duration, onProgressUpdate]);
  
  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    setIsMuted(value === 0);
  }, []);
  
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // Handle playback rate change
  const handlePlaybackRateChange = useCallback((rate: number) => {
    console.log("🎛️ Speed control: Changing playback rate from", playbackRate + "x", "to", rate + "x");
    setPlaybackRate(rate);
  }, [playbackRate]);

  return {
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
  };
};

export default useAudioPlayer;
