
import { useState, useEffect, useRef } from 'react';
import { Podcast } from '@/types';
import { transformarCursoSimplificado } from '@/lib/api/transformers/courseTransformerSimplified';
import { useCoursePurchases } from '@/hooks/useCoursePurchases';
import { useToast } from "@/components/ui/use-toast";

interface LoadingState {
  course: boolean;
  purchases: boolean;
  overall: boolean;
}

interface ErrorState {
  course: string | null;
  purchases: string | null;
  overall: string | null;
}

export function useCourseDataSimplified(courseId: string | undefined) {
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    course: true,
    purchases: true,
    overall: true
  });
  const [errorState, setErrorState] = useState<ErrorState>({
    course: null,
    purchases: null,
    overall: null
  });
  const [isPremium, setIsPremium] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  
  const { toast } = useToast();
  const { hasPurchased, loading: purchasesLoading, refetch: refetchPurchases } = useCoursePurchases();
  
  // Control de llamadas duplicadas
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef(false);
  const loadAttemptRef = useRef(0);

  // Debug logs para el estado de loading
  useEffect(() => {
    console.log(`🔄 [useCourseDataSimplified] Loading states:`, {
      courseId,
      course: loadingState.course,
      purchases: loadingState.purchases,
      overall: loadingState.overall,
      purchasesLoading,
      isLoadingRef: isLoadingRef.current
    });
  }, [courseId, loadingState, purchasesLoading]);

  // Actualizar estado de purchases loading
  useEffect(() => {
    setLoadingState(prev => ({ 
      ...prev, 
      purchases: purchasesLoading,
      overall: prev.course || purchasesLoading
    }));
  }, [purchasesLoading]);

  useEffect(() => {
    const cargarCurso = async () => {
      const currentAttempt = ++loadAttemptRef.current;
      console.log(`🎯 [useCourseDataSimplified] Attempt #${currentAttempt} - Course: ${courseId || 'none'}`);

      if (!courseId) {
        console.log('❌ [useCourseDataSimplified] No courseId provided');
        setLoadingState(prev => ({ ...prev, course: false, overall: false }));
        setErrorState(prev => ({ ...prev, course: 'No se proporcionó ID del curso' }));
        return;
      }

      // Evitar llamadas duplicadas
      if (isLoadingRef.current) {
        console.log(`🚫 [useCourseDataSimplified] Already loading, skipping attempt #${currentAttempt}`);
        return;
      }

      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        console.log('🔄 [useCourseDataSimplified] Aborting previous request');
        abortControllerRef.current.abort();
      }

      isLoadingRef.current = true;
      setLoadingState(prev => ({ ...prev, course: true, overall: true }));
      setErrorState(prev => ({ ...prev, course: null }));
      abortControllerRef.current = new AbortController();

      try {
        console.log(`🔄 [useCourseDataSimplified] Loading course: ${courseId}`);
        
        const podcastData = await transformarCursoSimplificado(courseId);
        
        // Verificar si la petición fue cancelada
        if (abortControllerRef.current?.signal.aborted) {
          console.log('🔄 [useCourseDataSimplified] Request was aborted');
          return;
        }

        if (podcastData) {
          console.log(`✅ [useCourseDataSimplified] Course loaded: ${podcastData.title}`);
          
          setPodcast(podcastData);
          
          // Determinar si es premium
          const isPremiumCourse = podcastData.tipo_curso === 'pago';
          setIsPremium(isPremiumCourse);
          
          // Para cursos gratuitos, siempre hay acceso
          if (!isPremiumCourse) {
            setHasAccess(true);
            console.log(`🆓 [useCourseDataSimplified] Free course - access granted`);
          }
          
          setErrorState(prev => ({ ...prev, course: null }));
        } else {
          console.log(`❌ [useCourseDataSimplified] No course data found for: ${courseId}`);
          setErrorState(prev => ({ ...prev, course: 'Curso no encontrado' }));
        }

      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('🔄 [useCourseDataSimplified] Fetch was cancelled');
          return;
        }
        console.error(`❌ [useCourseDataSimplified] Error loading course:`, error);
        setErrorState(prev => ({ ...prev, course: error.message || 'Error desconocido' }));
        
        toast({
          title: "Error al cargar curso",
          description: "No se pudo cargar el curso. Reintentando...",
          variant: "destructive"
        });
      } finally {
        console.log('🏁 [useCourseDataSimplified] Course load completed');
        setLoadingState(prev => ({ ...prev, course: false }));
        isLoadingRef.current = false;
        abortControllerRef.current = null;
      }
    };
    
    cargarCurso();
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 [useCourseDataSimplified] Cleanup: aborting requests');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isLoadingRef.current = false;
    };
  }, [courseId, toast]);

  // Efecto separado para manejar cambios en el estado de compras
  useEffect(() => {
    if (podcast && isPremium && !purchasesLoading) {
      const userHasAccess = hasPurchased(courseId!);
      setHasAccess(userHasAccess);
      console.log(`🔄 [useCourseDataSimplified] Purchase status updated - access: ${userHasAccess}`);
    }
  }, [podcast, isPremium, purchasesLoading, hasPurchased, courseId]);

  // Actualizar loading overall
  useEffect(() => {
    const overall = loadingState.course || loadingState.purchases;
    if (loadingState.overall !== overall) {
      setLoadingState(prev => ({ ...prev, overall }));
    }
  }, [loadingState.course, loadingState.purchases, loadingState.overall]);

  const isLoading = loadingState.overall;
  const hasErrors = !!(errorState.course || errorState.purchases || errorState.overall);

  console.log(`📊 [useCourseDataSimplified] Final state:`, {
    courseId,
    hasPodcast: !!podcast,
    isLoading,
    hasErrors,
    isPremium,
    hasAccess,
    errorState
  });

  return { 
    podcast, 
    setPodcast, 
    isLoading,
    isPremium,
    hasAccess,
    refetchPurchases,
    errorState,
    loadingState
  };
}
