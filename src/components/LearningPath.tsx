import { useCallback, useMemo, useState, useEffect } from 'react';
import { Lesson, Module } from '../types';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText } from 'lucide-react';
import { useLessonStatus } from '@/hooks/learning-path/useLessonStatus';
import { useLessonClasses } from '@/hooks/learning-path/useLessonClasses';
import ModuleSection from './learning-path/ModuleSection';
import { useCourseCompletion } from '@/hooks/useCourseCompletion';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useUserLessonProgress } from '@/hooks/useUserLessonProgress';
import { useSummaries } from '@/hooks/useSummaries';
import CourseCompletionModal from '@/components/summaries/CourseCompletionModal';
import CreateSummaryModal from '@/components/summaries/CreateSummaryModal';
import ViewSummaryModal from '@/components/summaries/ViewSummaryModal';
import { CourseSummary } from '@/types/notes';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface LearningPathProps {
  lessons: Lesson[];
  modules: Module[];
  onSelectLesson: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
  currentLessonId: string | null;
  isGloballyPlaying: boolean;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
  podcast?: any;
}

const LearningPath = React.memo(({ 
  lessons, 
  modules, 
  onSelectLesson, 
  currentLessonId, 
  isGloballyPlaying,
  onProgressUpdate,
  onLessonComplete,
  podcast
}: LearningPathProps) => {
  // Get user progress data for course completion detection
  const { userProgress, markCompletionModalShown } = useUserProgress();
  const { lessonProgress } = useUserLessonProgress();
  const { fetchSummaries } = useSummaries();

  // State for summary viewing
  const [existingSummary, setExistingSummary] = useState<CourseSummary | null>(null);
  const [showViewSummaryModal, setShowViewSummaryModal] = useState(false);
  const [hasSummary, setHasSummary] = useState(false);

  // Extract courseId from podcast
  const courseId = podcast?.id || null;
  
  // SOLUCIÓN 3: Agregar estado de carga para evitar renderizado prematuro
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize audio player with lessons array
  const audioPlayer = useAudioPlayer({
    lessons,
    onLessonComplete: (lessonId: string) => {
      console.log('🎯 Audio player lesson complete:', lessonId);
      // Find the lesson object and call the original completion handler
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson && onLessonComplete) {
        onLessonComplete();
      }
    },
    onProgressUpdate: (lessonId: string, position: number) => {
      console.log('📊 Audio player progress update:', lessonId, position);
      if (onProgressUpdate) {
        onProgressUpdate(position);
      }
    }
  });
  
  // Course completion functionality
  const {
    showCompletionModal,
    showSummaryModal,
    completionStats,
    setShowCompletionModal,
    setShowSummaryModal,
    handleCreateSummary,
    handleOpenSummaryModal,
    checkHasSummary
  } = useCourseCompletion({
    podcast,
    userProgress,
    lessonProgress,
    markCompletionModalShown
  });

  // Check if course is completed
  const courseProgress = userProgress.find(p => p.course_id === courseId);
  const isCourseCompleted = courseProgress?.is_completed && courseProgress?.progress_percentage === 100;

  // SOLUCIÓN 3: Inicialización controlada
  useEffect(() => {
    if (lessons && lessons.length > 0 && modules && modules.length > 0) {
      console.log('📚 LearningPath initialized with data:', {
        lessonCount: lessons.length,
        moduleCount: modules.length
      });
      setIsInitialized(true);
    }
  }, [lessons, modules]);

  // Check for existing summary
  useEffect(() => {
    if (courseId && isCourseCompleted) {
      checkExistingSummary();
    }
  }, [courseId, isCourseCompleted]);

  const checkExistingSummary = async () => {
    if (!courseId) return;
    
    const hasExisting = await checkHasSummary();
    setHasSummary(hasExisting);
    
    if (hasExisting) {
      const summaries = await fetchSummaries(courseId);
      if (summaries && summaries.length > 0) {
        setExistingSummary(summaries[0]);
      }
    }
  };

  // Use custom hooks for status and classes
  const lessonStatusMap = useLessonStatus(lessons, modules, currentLessonId);
  const getLessonClasses = useLessonClasses(lessons, lessonStatusMap);

  console.log('🛤️ LearningPath render:', {
    currentLessonId,
    isGloballyPlaying,
    lessonCount: lessons.length,
    moduleCount: modules.length,
    courseId,
    lessonProgressCount: lessonProgress.length,
    isCourseCompleted,
    hasSummary,
    isInitialized,
    audioPlayerState: {
      currentLessonId: audioPlayer.currentLessonId,
      isPlaying: audioPlayer.isPlaying
    }
  });

  // SOLUCIÓN 3: Mostrar loading mientras se inicializa
  if (!isInitialized) {
    return (
      <div className="py-3">
        <h2 className="text-2xl font-bold mb-6 text-center">Tu Ruta de Aprendizaje</h2>
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5e16ea] mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Cargando lecciones...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // OPTIMIZADO: Memoizar función de agrupación con hash estable
  const getLessonsForModule = useCallback((moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return [];
    
    // Obtener lecciones en el orden definido por lessonIds del módulo
    return module.lessonIds
      .map(id => lessons.find(lesson => lesson.id === id))
      .filter((lesson): lesson is Lesson => lesson !== undefined);
  }, [
    // ESTABILIZADO: Hash más específico para evitar recálculos
    modules.map(m => `${m.id}:${m.lessonIds.join(',')}`).join('|'),
    lessons.map(l => l.id).join('|')
  ]);

  // Handle lesson play from audio player
  const handleAudioPlay = useCallback((lesson: Lesson) => {
    console.log('🎵 LearningPath: Audio play requested for:', lesson.title);
    onSelectLesson(lesson, true);
    audioPlayer.play(lesson);
  }, [onSelectLesson, audioPlayer]);

  // HANDLER DE CLICK CON LOGS ESPECÍFICOS
  const handleLessonClick = useCallback((lesson: Lesson, shouldAutoPlay = true) => {
    console.log('🎯🎯🎯 LEARNING PATH - CLICK RECIBIDO:', {
      lessonTitle: lesson.title,
      shouldAutoPlay,
      timestamp: new Date().toLocaleTimeString()
    });
    
    const status = lessonStatusMap.get(lesson.id);
    if (!status) {
      console.log('🚫🚫🚫 LEARNING PATH - NO STATUS FOUND:', lesson.title);
      return;
    }
    
    const { canPlay, isCompleted, isLocked, isFirstInSequence } = status;
    
    console.log('🎯🎯🎯 LEARNING PATH - VALIDACIÓN CLICK:', {
      lessonTitle: lesson.title,
      canPlay,
      isCompleted,
      isLocked,
      isFirstInSequence,
      action: canPlay ? 'PERMITIR REPRODUCCIÓN' : 'BLOQUEAR'
    });
    
    if (canPlay) {
      console.log('✅✅✅ LEARNING PATH - ENVIANDO A onSelectLesson:', lesson.title);
      
      // Call the original selection handler
      onSelectLesson(lesson, shouldAutoPlay);
      
      // Handle audio playback through the audio player
      if (shouldAutoPlay) {
        audioPlayer.play(lesson);
      }
      
      console.log('✅✅✅ LEARNING PATH - onSelectLesson LLAMADO EXITOSAMENTE:', lesson.title);
    } else {
      console.log('🚫🚫🚫 LEARNING PATH - LECCIÓN BLOQUEADA:', {
        lessonTitle: lesson.title,
        isLocked,
        reason: 'lección anterior no completada'
      });
    }
  }, [
    // ESTABILIZADO: Solo incluir referencias estables
    Array.from(lessonStatusMap.entries()).map(([id, status]) => `${id}:${status._hash || 'no-hash'}`).join('|'),
    onSelectLesson,
    audioPlayer
  ]);

  // OPTIMIZADO: Memoizar módulos ordenados
  const orderedModules = useMemo(() => {
    return modules.filter(module => {
      const moduleLessons = getLessonsForModule(module.id);
      return moduleLessons.length > 0;
    });
  }, [modules, getLessonsForModule]);

  // Handle fallback summary creation
  const handleFallbackSummaryClick = () => {
    setShowSummaryModal(true);
  };

  // Handle viewing existing summary
  const handleViewSummaryClick = () => {
    if (existingSummary) {
      setShowViewSummaryModal(true);
    }
  };
  
  return (
    <>
      <div className="py-3">
        <h2 className="text-2xl font-bold mb-6 text-center">Tu Ruta de Aprendizaje</h2>
        
        <div className="max-w-2xl mx-auto space-y-8">
          {orderedModules.map((module) => {
            const moduleLessons = getLessonsForModule(module.id);
            
            return (
              <ModuleSection
                key={module.id}
                module={module}
                moduleLessons={moduleLessons}
                lessonStatusMap={lessonStatusMap}
                getLessonClasses={getLessonClasses}
                currentLessonId={currentLessonId}
                isGloballyPlaying={isGloballyPlaying}
                courseId={courseId}
                lessonProgress={lessonProgress}
                onLessonClick={handleLessonClick}
                onProgressUpdate={onProgressUpdate}
                onLessonComplete={onLessonComplete}
                audioCurrentLessonId={audioPlayer.currentLessonId}
                audioIsPlaying={audioPlayer.isPlaying}
                audioCurrentTime={audioPlayer.currentTime}
                audioDuration={audioPlayer.duration}
                audioIsReady={audioPlayer.isReady}
                audioError={audioPlayer.error}
                getDisplayProgress={audioPlayer.getDisplayProgress}
                onPlay={handleAudioPlay}
                onPause={audioPlayer.pause}
                onSeek={audioPlayer.seek}
                onSkipBackward={audioPlayer.skipBackward}
                onSkipForward={audioPlayer.skipForward}
                onSetPlaybackRate={audioPlayer.setPlaybackRate}
                onSetVolume={audioPlayer.setVolume}
                onSetMuted={audioPlayer.setMuted}
              />
            );
          })}
          
          {/* Fallback Summary Button - only show if course is completed */}
          {isCourseCompleted && (
            <div className="text-center pt-8 border-t border-gray-200">
              {hasSummary && existingSummary ? (
                <Button
                  onClick={handleViewSummaryClick}
                  className="bg-[#5e16ea] hover:bg-[#4a11ba] text-white font-medium py-3 px-6"
                >
                  <FileText size={16} className="mr-2" />
                  Ver Resumen Personalizado
                </Button>
              ) : (
                <Button
                  onClick={handleFallbackSummaryClick}
                  className="bg-[#5e16ea] hover:bg-[#4a11ba] text-white font-medium py-3 px-6"
                >
                  <Sparkles size={16} className="mr-2" />
                  Crear Resumen Personalizado
                </Button>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {hasSummary ? 'Revisa tu resumen personalizado del curso' : 'Crea un resumen personalizado de lo que aprendiste'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Course Completion Modal */}
      {podcast && completionStats && (
        <CourseCompletionModal
          isOpen={showCompletionModal}
          onClose={setShowCompletionModal}
          onCreateSummary={handleOpenSummaryModal}
          course={podcast}
          stats={completionStats}
        />
      )}

      {/* Create Summary Modal */}
      {podcast && (
        <CreateSummaryModal
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          onSave={handleCreateSummary}
          courseTitle={podcast.title}
        />
      )}

      {/* View Summary Modal */}
      {existingSummary && (
        <ViewSummaryModal
          isOpen={showViewSummaryModal}
          onClose={() => setShowViewSummaryModal(false)}
          summary={existingSummary}
        />
      )}
    </>
  );
});

LearningPath.displayName = 'LearningPath';

export default LearningPath;
