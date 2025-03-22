
import { supabase } from "@/integrations/supabase/client";
import { Module, Lesson, SupabaseModulo, SupabaseLeccion } from "@/types";
import { podcasts } from "@/data/podcasts";

/**
 * Obtiene módulos y lecciones para un curso específico
 */
export const obtenerContenidoCurso = async (cursoId: string): Promise<{
  modulos: Module[];
  lecciones: Lesson[];
}> => {
  try {
    // Obtener módulos para este curso
    const { data: modulos, error: modulosError } = await supabase
      .from('modulos')
      .select('*')
      .eq('curso_id', cursoId)
      .order('orden');
      
    if (modulosError) {
      console.warn("Error al obtener módulos, usando módulos por defecto:", modulosError);
    }
    
    const modulosArray = modulos || [];
    
    // Obtener lecciones para todos los módulos de este curso
    const moduloIds = modulosArray.map(m => m.id);
    let lecciones: Lesson[] = [];
    let leccionesPorModulo: Record<string, string[]> = {};
    
    if (moduloIds.length > 0) {
      const { data: leccionesData, error: leccionesError } = await supabase
        .from('lecciones')
        .select('*')
        .in('modulo_id', moduloIds)
        .order('orden');
        
      if (leccionesError) {
        console.warn("Error al obtener lecciones:", leccionesError);
      } else {
        // Convertir lecciones al formato esperado
        lecciones = (leccionesData || []).map((l: SupabaseLeccion) => ({
          id: l.id,
          title: l.titulo,
          duration: l.duracion,
          audioUrl: l.url_audio,
          isCompleted: false, // Estado inicial
          isLocked: l.estado_inicial === 'bloqueado'
        }));
        
        // Crear un mapa de lecciones por módulo
        leccionesData?.forEach((l: SupabaseLeccion) => {
          if (!leccionesPorModulo[l.modulo_id]) {
            leccionesPorModulo[l.modulo_id] = [];
          }
          leccionesPorModulo[l.modulo_id].push(l.id);
        });
      }
    }
    
    // Si no hay lecciones, crear algunas de ejemplo o usar datos de muestra
    if (lecciones.length === 0) {
      // Buscar en datos de muestra primero
      const sampleCourse = podcasts.find(p => p.id === cursoId);
      if (sampleCourse && sampleCourse.lessons.length > 0) {
        lecciones = sampleCourse.lessons;
      } else {
        lecciones = [
          {
            id: `${cursoId}-lesson-1`,
            title: "Introducción al curso",
            duration: 5,
            audioUrl: "https://example.com/audio1.mp3",
            isCompleted: false,
            isLocked: false
          },
          {
            id: `${cursoId}-lesson-2`,
            title: "Conceptos básicos",
            duration: 10,
            audioUrl: "https://example.com/audio2.mp3",
            isCompleted: false,
            isLocked: true
          }
        ];
      }
    }
    
    // Construir módulos
    let modulosTransformados: Module[];
    if (modulosArray.length > 0) {
      modulosTransformados = modulosArray.map((m: SupabaseModulo) => ({
        id: m.id,
        title: m.titulo,
        lessonIds: leccionesPorModulo[m.id] || []
      }));
    } else {
      // Buscar en datos de muestra primero
      const sampleCourse = podcasts.find(p => p.id === cursoId);
      if (sampleCourse && sampleCourse.modules.length > 0) {
        modulosTransformados = sampleCourse.modules;
      } else {
        // Crear módulos por defecto si no hay
        modulosTransformados = [
          {
            id: `${cursoId}-module-1`,
            title: 'Conceptos Básicos',
            lessonIds: lecciones.map(l => l.id)
          }
        ];
      }
    }
    
    return {
      modulos: modulosTransformados,
      lecciones
    };
  } catch (error) {
    console.error("Error al obtener contenido del curso:", error);
    
    // Usar datos de muestra en caso de error
    const sampleCourse = podcasts.find(p => p.id === cursoId);
    if (sampleCourse) {
      return {
        modulos: sampleCourse.modules,
        lecciones: sampleCourse.lessons
      };
    }
    
    // Datos mínimos por defecto
    const leccionesDefecto = [
      {
        id: `${cursoId}-lesson-1`,
        title: "Introducción al curso",
        duration: 5,
        audioUrl: "https://example.com/audio1.mp3",
        isCompleted: false,
        isLocked: false
      }
    ];
    
    return {
      modulos: [
        {
          id: `${cursoId}-module-1`,
          title: 'Conceptos Básicos',
          lessonIds: leccionesDefecto.map(l => l.id)
        }
      ],
      lecciones: leccionesDefecto
    };
  }
};
