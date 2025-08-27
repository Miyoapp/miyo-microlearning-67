
import { useState, useCallback, useRef, useEffect } from 'react';
import { Lesson, Podcast } from '@/types';
import { UserCourseProgress } from '@/hooks/useUserProgress';
import { UserLessonProgress } from '@/hooks/lesson-progress/types';
import { User } from '@supabase/supabase-js';

interface UseLessonPlaybackProps {
  podcast: Podcast | null;
  currentLesson: Lesson | null;
  userProgress: UserCourseProgress[];
  user: User | null;
  lessonProgress: UserLessonProgress[];
  updateLessonPosition: (lessonId: string, courseId: string, position: number) => Promise<void>;
}

export function useLessonPlayback({
  podcast,
  currentLesson,
  userProgress,
  user,
  lessonProgress,
  updateLessonPosition
}: UseLessonPlaybackProps) {
  // Estado centralizado del reproductor
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Referencia única al elemento audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionSaved = useRef<number>(0);

  // Configurar auto-advance
  const isAutoAdvanceAllowed = userProgress?.find(p => p.course_id === podcast?.id)?.auto_advance || false;

  // Crear/actualizar elemento audio cuando cambia la lección
  useEffect(() => {
    if (!currentLesson?.urlAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    console.log('🎵 Creating/updating audio element for:', currentLesson.title);
    
    // Limpiar audio anterior
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.removeEventListener('ended', handleAudioEnded);
      audioRef.current.removeEventListener('error', handleAudioError);
    }

    // Crear nuevo elemento audio
    const audio = new Audio(currentLesson.urlAudio);
    audio.preload = 'metadata';
    audio.playbackRate = playbackRate;
    audio.volume = volume;
    audio.muted = isMuted;

    // Configurar event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('loadstart', () => setIsLoading(true));
    audio.addEventListener('canplay', () => setIsLoading(false));

    audioRef.current = audio;

    // Limpiar al desmontar
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current.removeEventListener('error', handleAudioError);
      }
    };
  }, [currentLesson?.id, currentLesson?.urlAudio]);

  // Manejar metadatos cargados
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current && currentLesson) {
      const audioDuration = audioRef.current.duration;
      setDuration(audioDuration);
      
      // Restaurar posición guardada si existe - buscar en lessonProgress
      const lessonProgressData = lessonProgress.find(p => p.lesson_id === currentLesson.id);
      const savedPosition = lessonProgressData?.current_position || 0;
      if (savedPosition > 0 && savedPosition < audioDuration) {
        audioRef.current.currentTime = savedPosition;
        setCurrentTime(savedPosition);
        console.log('🔄 Restored position:', savedPosition, 'for lesson:', currentLesson.title);
      }
    }
  }, [currentLesson, lessonProgress]);

  // Actualizar tiempo actual
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      
      // Guardar progreso cada 5 segundos
      if (Math.abs(time - lastPositionSaved.current) >= 5) {
        lastPositionSaved.current = time;
        handleProgressUpdate(time);
      }
    }
  }, []);

  // Manejar final del audio
  const handleAudioEnded = useCallback(() => {
    console.log('🏁 Audio ended for lesson:', currentLesson?.title);
    setIsPlaying(false);
    
    if (currentLesson && podcast && user) {
      // Marcar como completada
      handleLessonComplete();
    }
  }, [currentLesson, podcast, user]);

  // Manejar errores de audio
  const handleAudioError = useCallback((e: Event) => {
    console.error('❌ Audio error:', e);
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  // Toggle play/pause
  const handleTogglePlay = useCallback(async () => {
    if (!audioRef.current || isLoading) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        console.log('⏸️ Paused:', currentLesson?.title);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        console.log('▶️ Playing:', currentLesson?.title);
      }
    } catch (error) {
      console.error('❌ Play/pause error:', error);
      setIsPlaying(false);
    }
  }, [isPlaying, isLoading, currentLesson]);

  // Manejar selección de lección
  const handleSelectLesson = useCallback((lesson: Lesson, shouldAutoPlay = false) => {
    console.log('🎯 useLessonPlayback - handleSelectLesson:', {
      lessonTitle: lesson.title,
      shouldAutoPlay,
      currentLessonId: currentLesson?.id,
      isSameLesson: currentLesson?.id === lesson.id
    });

    // Si es la misma lección, solo cambiar estado de reproducción
    if (currentLesson?.id === lesson.id) {
      if (shouldAutoPlay !== isPlaying) {
        handleTogglePlay();
      }
      return;
    }

    // Pausar audio actual si está reproduciéndose
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // La lección actual se establecerá desde el componente padre
    // Solo configuramos el estado de reproducción
    if (shouldAutoPlay) {
      // Dar tiempo para que se establezca la nueva lección
      setTimeout(() => {
        handleTogglePlay();
      }, 100);
    }
  }, [currentLesson, isPlaying, handleTogglePlay]);

  // Actualizar progreso en la base de datos
  const handleProgressUpdate = useCallback(async (position: number) => {
    if (!currentLesson || !podcast || !user) return;

    try {
      await updateLessonPosition(currentLesson.id, podcast.id, position);
    } catch (error) {
      console.error('❌ Error updating lesson position:', error);
    }
  }, [currentLesson, podcast, user, updateLessonPosition]);

  // Completar lección
  const handleLessonComplete = useCallback(() => {
    if (!currentLesson || !podcast || !user) return;

    console.log('🎉 Lesson completed:', currentLesson.title);
    
    // Actualizar posición al final
    handleProgressUpdate(duration);
    
    // El manejo de completación se hará desde el componente padre
  }, [currentLesson, podcast, user, duration, handleProgressUpdate]);

  // Buscar (seek)
  const handleSeek = useCallback((time: number) => {
    if (!audioRef.current || !duration) return;

    const clampedTime = Math.max(0, Math.min(time, duration));
    audioRef.current.currentTime = clampedTime;
    setCurrentTime(clampedTime);
    handleProgressUpdate(clampedTime);
  }, [duration, handleProgressUpdate]);

  // Saltar hacia atrás (15 segundos)
  const handleSkipBackward = useCallback(() => {
    handleSeek(currentTime - 15);
  }, [currentTime, handleSeek]);

  // Saltar hacia adelante (15 segundos)
  const handleSkipForward = useCallback(() => {
    handleSeek(currentTime + 15);
  }, [currentTime, handleSeek]);

  // Cambiar velocidad de reproducción
  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  // Cambiar volumen
  const handleVolumeChange = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  // Formatear tiempo
  const formatTime = useCallback((timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
      }
    };
  }, []);

  return {
    // Estados
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    isLoading,
    isAutoAdvanceAllowed,

    // Funciones
    handleTogglePlay,
    handleSelectLesson,
    handleProgressUpdate,
    handleSeek,
    handleSkipBackward,
    handleSkipForward,
    handlePlaybackRateChange,
    handleVolumeChange,
    toggleMute,
    formatTime,

    // Referencias
    audioRef
  };
}
