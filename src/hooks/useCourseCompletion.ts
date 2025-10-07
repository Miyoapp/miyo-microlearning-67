import { useState, useEffect, useCallback, useRef } from 'react';
import { Podcast } from '@/types';
import { CourseCompletionStats } from '@/types/notes';
import { useSummaries } from '@/hooks/useSummaries';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

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
  
  const { user: auth } = useAuth();
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

  // NUEVA FUNCIÓN: Detectar completitud desde estado local (igual que el banner)
  useEffect(() => {
    if (!podcast) return;
    
    const courseProgress = userProgress.find(p => p.course_id === podcast.id);
    const isCompleted = courseProgress?.is_completed && courseProgress?.progress_percentage === 100;
    const modalAlreadyShown = courseProgress?.completion_modal_shown || modalShownForCourseRef.current === podcast.id;
    
    if (isCompleted && !modalAlreadyShown) {
      console.log('🎉 IMMEDIATE - Course completed detected from state, showing modal NOW at:', new Date().toISOString());
      showModalImmediately(podcast.id, podcast.lessonCount, podcast.duration);
      modalShownForCourseRef.current = podcast.id;
    }
  }, [podcast, userProgress, showModalImmediately]);

  // SOLUCIÓN 5: Función directa para casos urgentes
  const forceShowCompletionModal = useCallback(async () => {
    if (!podcast) return;
    
    console.log('⚡ FORCE SHOW - Forcing completion modal display');
    await showModalImmediately(podcast.id, podcast.lessonCount, podcast.duration);
  }, [podcast, showModalImmediately]);

  // Reset cuando cambia el podcast
  useEffect(() => {
    if (podcast?.id && modalShownForCourseRef.current !== podcast.id) {
      modalShownForCourseRef.current = null;
      previousProgressRef.current = 0;
    }
  }, [podcast?.id]);

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
    
    // No cerramos los modales automáticamente - se hará desde el componente
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
    forceShowCompletionModal // Función directa para mostrar modal
  };
}