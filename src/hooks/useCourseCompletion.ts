import { useState, useEffect, useCallback, useRef } from 'react';
import { Podcast } from '@/types';
import { CourseCompletionStats } from '@/types/notes';
import { useSummaries } from '@/hooks/useSummaries';

interface UseCourseCompletionProps {
  podcast: Podcast | null;  
  userProgress: any[];
  lessonProgress: any[];
  markCompletionModalShown?: (courseId: string) => Promise<void>;
}

export function useCourseCompletion({ podcast, userProgress, lessonProgress, markCompletionModalShown }: UseCourseCompletionProps) {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [completionStats, setCompletionStats] = useState<CourseCompletionStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const previousProgressRef = useRef<number>(0);
  const isCheckingRef = useRef(false);
  const modalShownForCourseRef = useRef<string | null>(null);
  
  const { getCourseStats, createSummary, hasSummary } = useSummaries();
  
  // Use ref to keep stable reference to getCourseStats
  const getCourseStatsRef = useRef(getCourseStats);
  getCourseStatsRef.current = getCourseStats;

  // SOLUCIÓN 1: Mostrar modal inmediatamente y cargar stats en paralelo
  const showModalImmediately = useCallback(async (courseId: string, lessonCount: number, duration: number) => {
    console.log('🚀 IMMEDIATE MODAL - Showing modal instantly');
    
    // Mostrar modal inmediatamente con stats básicos
    setCompletionStats({
      totalLessons: lessonCount,
      completedLessons: lessonCount, // Sabemos que está completo
      totalNotes: 0, // Se actualizará después
      totalTimeSpent: duration * 60,
      courseDuration: duration * 60
    });
    
    setShowCompletionModal(true);
    
    // Marcar como mostrado inmediatamente (no bloqueante)
    if (markCompletionModalShown) {
      markCompletionModalShown(courseId).catch(console.error);
    }
    
    // Cargar stats detalladas en paralelo (sin bloquear el modal)
    setIsLoadingStats(true);
    try {
      const stats = await getCourseStatsRef.current(courseId);
      if (stats) {
        setCompletionStats(prev => prev ? {
          ...prev,
          completedLessons: stats.completedLessons,
          totalNotes: stats.totalNotes
        } : null);
      }
    } catch (error) {
      console.error('Error loading detailed stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [markCompletionModalShown]);

  // SOLUCIÓN 2: Lógica mejorada de detección
  const checkCourseCompletion = useCallback(async () => {
    console.log('🔍 IMPROVED CHECK - Starting course completion check:', {
      hasPodcast: !!podcast,
      hasUserProgress: !!userProgress,
      isCurrentlyChecking: isCheckingRef.current,
      podcastId: podcast?.id
    });

    // Prevent multiple simultaneous checks
    if (isCheckingRef.current) {
      console.log('⏸️ ALREADY CHECKING - Skipping to prevent race condition');
      return;
    }

    if (!podcast || !userProgress) {
      console.log('⏹️ SKIP - Completion check skipped: missing data');
      return;
    }

    isCheckingRef.current = true;

    try {
      const courseProgress = userProgress.find(p => p.course_id === podcast.id);
      
      console.log('📊 PROGRESS ANALYSIS:', {
        courseId: podcast.id,
        isCompleted: courseProgress?.is_completed,
        progressPercentage: courseProgress?.progress_percentage,
        completionModalShown: courseProgress?.completion_modal_shown,
        previousProgress: previousProgressRef.current,
        modalAlreadyShownForThisCourse: modalShownForCourseRef.current === podcast.id
      });
      
      // SOLUCIÓN 3: Condiciones mejoradas
      const shouldShowModal = (
        courseProgress?.is_completed && 
        courseProgress?.progress_percentage === 100 && 
        courseProgress?.completion_modal_shown === false &&
        modalShownForCourseRef.current !== podcast.id // Evitar mostrar múltiples veces
      );
      
      // ALTERNATIVA: Detectar transición de incompleto a completo
      const wasIncompleteNowComplete = (
        courseProgress?.is_completed && 
        courseProgress?.progress_percentage === 100 && 
        previousProgressRef.current < 100 &&
        courseProgress?.completion_modal_shown === false &&
        modalShownForCourseRef.current !== podcast.id
      );
      
      if (shouldShowModal || wasIncompleteNowComplete) {
        console.log('🎉 COURSE COMPLETED - Showing modal immediately!');
        
        // Marcar que ya mostramos el modal para este curso
        modalShownForCourseRef.current = podcast.id;
        
        // Mostrar modal inmediatamente
        await showModalImmediately(podcast.id, podcast.lessonCount, podcast.duration);
        
        console.log('✅ MODAL SHOWN INSTANTLY');
      } else {
        console.log('🔄 SKIP MODAL - Conditions not met');
      }
      
      // Update previous progress
      if (courseProgress?.progress_percentage !== undefined) {
        previousProgressRef.current = courseProgress.progress_percentage;
      }
    } finally {
      isCheckingRef.current = false;
    }
  }, [podcast, userProgress, showModalImmediately]);

  // SOLUCIÓN 4: Reset cuando cambia el podcast
  useEffect(() => {
    if (podcast?.id && modalShownForCourseRef.current !== podcast.id) {
      modalShownForCourseRef.current = null;
      previousProgressRef.current = 0;
    }
  }, [podcast?.id]);

  // Effect principal
  useEffect(() => {
    console.log('🔄 EFFECT TRIGGER - Course completion check triggered');
    checkCourseCompletion();
  }, [checkCourseCompletion]);

  // SOLUCIÓN 5: Función directa para casos urgentes
  const forceShowCompletionModal = useCallback(async () => {
    if (!podcast) return;
    
    console.log('⚡ FORCE SHOW - Forcing completion modal display');
    await showModalImmediately(podcast.id, podcast.lessonCount, podcast.duration);
  }, [podcast, showModalImmediately]);

  // Handle creating summary
  const handleCreateSummary = useCallback(async (formData: {
    title: string;
    keyConcepts: string;
    personalInsight: string;
    actionPlans: string[];
  }) => {
    if (!podcast) return;
    
    await createSummary(
      podcast.id, 
      formData.title, 
      '', 
      'personal',
      formData.keyConcepts,
      formData.personalInsight,
      formData.actionPlans
    );
    
    setShowSummaryModal(false);
    setShowCompletionModal(false);
  }, [podcast, createSummary]);

  const handleOpenSummaryModal = useCallback(() => {
    console.log('📝 SUMMARY MODAL - Opening summary modal');
    setShowCompletionModal(false);
    setShowSummaryModal(true);
  }, []);

  const handleCloseCompletionModal = useCallback(() => {
    console.log('❌ CLOSE MODAL - Closing completion modal');
    setShowCompletionModal(false);
  }, []);

  const checkHasSummary = useCallback(async (): Promise<boolean> => {
    if (!podcast) return false;
    return await hasSummary(podcast.id);
  }, [podcast, hasSummary]);

  return {
    showCompletionModal,
    showSummaryModal,
    completionStats,
    isLoadingStats,
    setShowCompletionModal: handleCloseCompletionModal,
    setShowSummaryModal,
    handleCreateSummary,
    handleOpenSummaryModal,
    checkHasSummary,
    forceShowCompletionModal // Nueva función para casos urgentes
  };
}