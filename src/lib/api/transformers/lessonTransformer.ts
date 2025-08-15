
import { Lesson, SupabaseLeccion } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Obtiene las lecciones para un curso específico
 */
export const obtenerLecciones = async (cursoId: string): Promise<Lesson[]> => {
  try {
    console.log(`Obteniendo lecciones para curso: ${cursoId}`);
    
    // Primero obtenemos todos los IDs de módulos para este curso
    const { data: modulosData, error: errorModulos } = await supabase
      .from('modulos')
      .select('id')
      .eq('curso_id', cursoId);
      
    if (errorModulos || !modulosData || modulosData.length === 0) {
      console.warn(`No se encontraron módulos para obtener lecciones del curso ${cursoId}`);
      return [];
    }
    
    // Obtener todas las lecciones que pertenecen a estos módulos
    const moduloIds = modulosData.map(m => m.id);
    
    const { data: leccionesData, error: errorLecciones } = await supabase
      .from('lecciones')
      .select('*')
      .in('modulo_id', moduloIds)
      .order('orden', { ascending: true });
      
    if (errorLecciones) {
      console.error(`Error al obtener lecciones para curso ${cursoId}:`, errorLecciones);
      throw errorLecciones;
    }
    
    if (!leccionesData || leccionesData.length === 0) {
      console.warn(`No se encontraron lecciones para el curso ${cursoId}`);
      return [];
    }
    
    // Transformar los datos de Supabase al formato de la aplicación
    console.log(`Se encontraron ${leccionesData.length} lecciones para el curso ${cursoId}`);
    
    // Por defecto, solo la primera lección está desbloqueada
    const lecciones = leccionesData.map((leccion: SupabaseLeccion, index: number): Lesson => {
      const isFirstLesson = index === 0;
      
      return {
        id: leccion.id,
        title: leccion.titulo,
        duracion: leccion.duracion,
        urlAudio: leccion.url_audio,
        isCompleted: false,
        isLocked: leccion.estado_inicial === 'bloqueado' && !isFirstLesson,
        description: leccion.descripcion,
        orden: leccion.orden
      };
    });
    
    return lecciones;
  } catch (error) {
    console.error(`Error al obtener lecciones para curso ${cursoId}:`, error);
    return [];
  }
};
