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

  // Función directa para mostrar modal (sin esperar userProgress)
  const triggerCompletionCheck = useCallback(async () => {
    if (!podcast) {
      console.log('⏹️ SKIP - No podcast available for completion check');
      return;
    }

    // Evitar mostrar múltiples veces para el mismo curso
    if (modalShownForCourseRef.current === podcast.id) {
      console.log('⏸️ SKIP - Modal already shown for this course:', podcast.id);
      return;
    }

    console.log('🎉 DIRECT TRIGGER - Showing completion modal immediately!');
    
    // Marcar que ya mostramos el modal para este curso
    modalShownForCourseRef.current = podcast.id;
    
    // Mostrar modal inmediatamente
    await showModalImmediately(podcast.id, podcast.lessonCount, podcast.duration);
    
    console.log('✅ COMPLETION MODAL SHOWN INSTANTLY');
  }, [podcast, showModalImmediately]);

  // Reset cuando cambia el podcast
  useEffect(() => {
    if (podcast?.id && modalShownForCourseRef.current !== podcast.id) {
      modalShownForCourseRef.current = null;
      previousProgressRef.current = 0;
    }
  }, [podcast?.id]);

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
    triggerCompletionCheck // Nueva función para activación directa
  };
}