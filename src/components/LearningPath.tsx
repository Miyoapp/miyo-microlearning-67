
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
import { useSummaries } from '@/hooks/useSummaries';
import CourseCompletionModal from '@/components/summaries/CourseCompletionModal';
import CreateSummaryModal from '@/components/summaries/CreateSummaryModal';
import ViewSummaryModal from '@/components/summaries/ViewSummaryModal';
import { CourseSummary } from '@/types/notes';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

interface LearningPathProps {
  lessons: Lesson[];
  modules: Module[];
  currentLessonId: string | null;
  isGloballyPlaying: boolean;
  lessonProgress: any[];
  podcast?: any;
}

const LearningPath = React.memo(({ 
  lessons, 
  modules, 
  currentLessonId, 
  isGloballyPlaying,
  lessonProgress,
  podcast
}: LearningPathProps) => {
  // Audio player context
  const { selectLesson, setOnCourseCompletedCallback } = useAudioPlayer();
  
  // Get user progress data for course completion detection
  const { userProgress, markCompletionModalShown } = useUserProgress();
  const { fetchSummaries } = useSummaries();

  // State for summary viewing
  const [existingSummary, setExistingSummary] = useState<CourseSummary | null>(null);
  const [showViewSummaryModal, setShowViewSummaryModal] = useState(false);
  const [hasSummary, setHasSummary] = useState(false);

  // Extract courseId from podcast
  const courseId = podcast?.id || null;
  
  // Course completion functionality - simplified without lesson progress dependency
  const {
    showCompletionModal,
    showSummaryModal,
    completionStats,
    setShowCompletionModal,
    setShowSummaryModal,
    handleCreateSummary,
    handleOpenSummaryModal,
    checkHasSummary,
    triggerCompletionCheck
  } = useCourseCompletion({
    podcast,
    userProgress,
    lessonProgress,
    markCompletionModalShown
  });

  // Check if course is completed
  const courseProgress = userProgress.find(p => p.course_id === courseId);
  const isCourseCompleted = courseProgress?.is_completed && courseProgress?.progress_percentage === 100;

  // Set up course completion callback for immediate modal display
  useEffect(() => {
    if (triggerCompletionCheck) {
      setOnCourseCompletedCallback(triggerCompletionCheck);
    }
    
    return () => {
      setOnCourseCompletedCallback(null);
    };
  }, [triggerCompletionCheck, setOnCourseCompletedCallback]);

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
  
  const handleCreateSummaryWrapper = useCallback(async (formData: {
  title: string;
  keyConcepts: string;
  personalInsight: string;
  actionPlans: string[];
}) => {
  await handleCreateSummary(formData);
  await checkExistingSummary();
}, [handleCreateSummary, checkExistingSummary]);
  
  // Use custom hooks for status and classes
  const lessonStatusMap = useLessonStatus(lessons, modules, currentLessonId, lessonProgress);
  const getLessonClasses = useLessonClasses(lessons, lessonStatusMap);

  console.log('🛤️ LearningPath render:', {
    currentLessonId,
    isGloballyPlaying,
    lessonCount: lessons.length,
    moduleCount: modules.length,
    courseId,
    isCourseCompleted,
    hasSummary
  });

  // Get lessons for module
  const getLessonsForModule = useCallback((moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return [];
    
    return module.lessonIds
      .map(id => lessons.find(lesson => lesson.id === id))
      .filter((lesson): lesson is Lesson => lesson !== undefined);
  }, [
    modules.map(m => `${m.id}:${m.lessonIds.join(',')}`).join('|'),
    lessons.map(l => l.id).join('|')
  ]);

  // Handle lesson click with new audio system
  const handleLessonClick = useCallback((lesson: Lesson, shouldAutoPlay = true) => {
    console.log('🎯 LearningPath - Lesson click:', {
      lessonTitle: lesson.title,
      shouldAutoPlay,
      timestamp: new Date().toLocaleTimeString()
    });
    
    const status = lessonStatusMap.get(lesson.id);
    if (!status) {
      console.log('🚫 LearningPath - No status found:', lesson.title);
      return;
    }
    
    const { canPlay } = status;
    
    if (canPlay && podcast) {
      console.log('✅ LearningPath - Selecting lesson via AudioPlayer:', lesson.title);
      selectLesson(lesson, podcast, shouldAutoPlay);
    } else {
      console.log('🚫 LearningPath - Lesson blocked:', lesson.title);
    }
  }, [lessonStatusMap, podcast, selectLesson]);

  // Memoize ordered modules
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
