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

  // FALLBACK: Este método se mantiene como respaldo en caso de que
  // el useEffect no se dispare por alguna razón (edge case)
  const triggerCompletionCheck = useCallback(async () => {
    if (!podcast) {
      console.log('⏹️ SKIP - No podcast available for completion check');
      return;
    }

    console.log('🔍 COMPLETION CHECK - Querying DB directly for fresh data...');
    
    try {
      // CONSULTA DIRECTA A LA DB para obtener datos frescos
      const { data: courseProgress, error } = await supabase
        .from('user_course_progress')
        .select('progress_percentage, is_completed, completion_modal_shown')
        .eq('course_id', podcast.id)
        .eq('user_id', auth.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching course progress:', error);
        return;
      }

      // Treat null as "no progress yet" - course not completed
      if (!courseProgress) {
        console.log('⚠️ No progress found in DB, course not completed yet');
        return;
      }

      // Verificar REALMENTE que el curso está completo según la DB
      const isReallyCompleted = courseProgress.is_completed && courseProgress.progress_percentage === 100;
      
      if (!isReallyCompleted) {
        console.log('⏹️ SKIP - Course not actually completed yet (DB check)', courseProgress);
        return;
      }

      // Evitar mostrar múltiples veces para el mismo curso
      if (modalShownForCourseRef.current === podcast.id) {
        console.log('⏸️ SKIP - Modal already shown for this course (memory):', podcast.id);
        return;
      }

      // Verificar que no se haya mostrado ya el modal en la DB
      if (courseProgress?.completion_modal_shown) {
        console.log('⏸️ SKIP - Modal already shown according to database');
        return;
      }

      console.log('🎉 DB CONFIRMED - Course really completed, showing modal IMMEDIATELY!');
      
      // Marcar que ya mostramos el modal para este curso
      modalShownForCourseRef.current = podcast.id;
      
      // Mostrar modal inmediatamente con datos frescos de la DB
      await showModalImmediately(podcast.id, podcast.lessonCount, podcast.duration);
      
      console.log('✅ COMPLETION MODAL SHOWN INSTANTLY (DB verified)');
      
    } catch (error) {
      console.error('❌ Error checking course completion from DB:', error);
      
      // FALLBACK: Si falla la verificación DB, usar forceShowCompletionModal
      console.log('🚨 Using fallback completion check...');
      setTimeout(() => {
        if (modalShownForCourseRef.current !== podcast.id) {
          // Fallback directo sin dependencia circular
          showModalImmediately(podcast.id, podcast.lessonCount, podcast.duration);
        }
      }, 200);
    }
  }, [podcast, showModalImmediately]);

  // SOLUCIÓN 5: Función directa para casos urgentes
  const forceShowCompletionModal = useCallback(async () => {
    if (!podcast) return;
    
    console.log('⚡ FORCE SHOW - Forcing completion modal display');
    await showModalImmediately(podcast.id, podcast.lessonCount, podcast.duration);
  }, [podcast, showModalImmediately]);

  // SOLUCIÓN PRINCIPAL: Escuchar cambios en userProgress para mostrar modal automáticamente
  useEffect(() => {
    if (!podcast || !userProgress || userProgress.length === 0) return;

    const courseProgress = userProgress.find(p => p.course_id === podcast.id);

    if (!courseProgress) return;

    const isCompleted = courseProgress.is_completed && courseProgress.progress_percentage === 100;
    const alreadyShownInDB = courseProgress.completion_modal_shown;
    const alreadyShownInSession = modalShownForCourseRef.current === podcast.id;

    if (isCompleted && !alreadyShownInDB && !alreadyShownInSession) {
      console.log('🎉 STATE-BASED MODAL - Course completed via local state', {
        courseId: podcast.id,
        courseTitle: podcast.title,
        timestamp: new Date().toISOString()
      });

      modalShownForCourseRef.current = podcast.id;
      showModalImmediately(podcast.id, podcast.lessonCount, podcast.duration);
    }
  }, [podcast, userProgress, showModalImmediately]);

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
    triggerCompletionCheck, // Nueva función para activación directa con verificación DB
    forceShowCompletionModal // Función de fallback para casos urgentes
  };
}