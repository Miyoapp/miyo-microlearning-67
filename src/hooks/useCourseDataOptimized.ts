
import { useState, useEffect, useRef } from 'react';
import { Podcast } from '@/types';
import { transformarCursoOptimizado } from '@/lib/api/transformers/courseTransformerOptimized';
import { useCoursePurchases } from '@/hooks/useCoursePurchases';
import { useToast } from "@/components/ui/use-toast";

export function useCourseDataOptimized(courseId: string | undefined) {
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  
  const { toast } = useToast();
  const { hasPurchased, loading: purchasesLoading, refetch: refetchPurchases } = useCoursePurchases();
  
  // Control de llamadas duplicadas
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadAttemptRef = useRef(0);
  const lastLoadTimeRef = useRef<number>(0);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const cargarCursoCompleto = async () => {
      const currentAttempt = ++loadAttemptRef.current;
      const currentTime = Date.now();
      
      console.log(`🎯 [useCourseDataOptimized] Attempt #${currentAttempt} - Course: ${courseId || 'none'}`);
      console.log(`🎯 [useCourseDataOptimized] isLoading: ${isLoadingRef.current}, time since last: ${currentTime - lastLoadTimeRef.current}ms`);

      if (!courseId) {
        console.log('❌ [useCourseDataOptimized] No courseId provided');
        setIsLoading(false);
        return;
      }

      // Evitar llamadas duplicadas
      if (isLoadingRef.current) {
        console.log(`🚫 [useCourseDataOptimized] Already loading, skipping attempt #${currentAttempt}`);
        return;
      }

      // Evitar llamadas muy frecuentes (menos de 2 segundos)
      if (currentTime - lastLoadTimeRef.current < 2000) {
        console.log(`🚫 [useCourseDataOptimized] Too frequent call, skipping attempt #${currentAttempt}`);
        return;
      }

      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        console.log('🔄 [useCourseDataOptimized] Aborting previous request');
        abortControllerRef.current.abort();
      }

      isLoadingRef.current = true;
      setIsLoading(true);
      lastLoadTimeRef.current = currentTime;
      abortControllerRef.current = new AbortController();

      try {
        console.log(`🔄 [useCourseDataOptimized] Loading course: ${courseId}`);
        
        // Cargar curso con transformer optimizado
        const podcastData = await transformarCursoOptimizado(courseId);
        
        // Verificar si la petición fue cancelada
        if (abortControllerRef.current?.signal.aborted) {
          console.log('🔄 [useCourseDataOptimized] Request was aborted');
          return;
        }

        if (podcastData) {
          console.log(`✅ [useCourseDataOptimized] Course loaded: ${podcastData.title}`);
          
          // Determinar si es premium y verificar acceso
          const isPremiumCourse = podcastData.tipo_curso === 'pago';
          setIsPremium(isPremiumCourse);
          
          // Para cursos gratuitos, siempre hay acceso
          if (!isPremiumCourse) {
            setHasAccess(true);
            console.log(`🆓 [useCourseDataOptimized] Free course - access granted`);
          } else {
            // Para cursos premium, esperar a que se carguen las compras
            if (!purchasesLoading) {
              const userHasAccess = hasPurchased(courseId);
              setHasAccess(userHasAccess);
              console.log(`💰 [useCourseDataOptimized] Premium course - access: ${userHasAccess}`);
            }
          }

          // Generar módulos por defecto si no existen
          if (!podcastData.modules || podcastData.modules.length === 0) {
            console.log('🔧 [useCourseDataOptimized] Generating default modules');
            podcastData.modules = createDefaultModules(podcastData);
          }

          // Inicializar estado de lecciones
          podcastData.lessons = initializeLessonsState(podcastData);
          
          setPodcast(podcastData);
        } else {
          console.log(`❌ [useCourseDataOptimized] No course data found for: ${courseId}`);
        }

      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('🔄 [useCourseDataOptimized] Fetch was cancelled');
          return;
        }
        console.error(`❌ [useCourseDataOptimized] Error loading course:`, error);
        toast({
          title: "Error al cargar curso",
          description: "No se pudo cargar el curso solicitado. Por favor, intenta de nuevo.",
          variant: "destructive"
        });
      } finally {
        console.log('🏁 [useCourseDataOptimized] Load completed');
        setIsLoading(false);
        isLoadingRef.current = false;
        abortControllerRef.current = null;
      }
    };
    
    cargarCursoCompleto();
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 [useCourseDataOptimized] Cleanup: aborting requests');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isLoadingRef.current = false;
    };
  }, [courseId]); // Solo courseId como dependencia

  // Efecto separado para manejar cambios en el estado de compras
  useEffect(() => {
    if (podcast && isPremium && !purchasesLoading) {
      const userHasAccess = hasPurchased(courseId!);
      setHasAccess(userHasAccess);
      console.log(`🔄 [useCourseDataOptimized] Purchase status updated - access: ${userHasAccess}`);
    }
  }, [podcast, isPremium, purchasesLoading, hasPurchased, courseId]);

  return { 
    podcast, 
    setPodcast, 
    isLoading,
    isPremium,
    hasAccess,
    refetchPurchases
  };
}

// Helper functions
function createDefaultModules(podcast: Podcast) {
  console.log('📝 [useCourseDataOptimized] Creating default modules for:', podcast.title);
  return [
    {
      id: 'module-1',
      title: 'Conceptos Básicos',
      lessonIds: podcast.lessons.slice(0, 2).map(l => l.id)
    },
    {
      id: 'module-2',
      title: 'Técnicas Intermedias',
      lessonIds: podcast.lessons.slice(2, 4).map(l => l.id)
    },
    {
      id: 'module-3',
      title: 'Aplicación Práctica',
      lessonIds: podcast.lessons.slice(4).map(l => l.id)
    }
  ];
}

function initializeLessonsState(podcast: Podcast) {
  console.log('🎯 [useCourseDataOptimized] Initializing lessons state for:', podcast.title);
  
  if (!podcast.modules || podcast.modules.length === 0) {
    console.log('⚠️ [useCourseDataOptimized] No modules found, returning lessons as-is');
    return podcast.lessons;
  }
  
  const firstModule = podcast.modules[0];
  const firstLessonId = firstModule.lessonIds[0];
  
  console.log('🔓 [useCourseDataOptimized] First lesson ID to unlock:', firstLessonId);
  
  return podcast.lessons.map(lesson => {
    if (lesson.id === firstLessonId) {
      return { ...lesson, isLocked: false, isCompleted: false };
    } else {
      return { ...lesson, isLocked: true, isCompleted: false };
    }
  });
}
