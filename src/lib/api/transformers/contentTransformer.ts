
import { Lesson, Module, Podcast, SupabaseCurso, SupabaseLeccion, SupabaseModulo } from "@/types";
import { obtenerCategoria } from "./categoryTransformer";
import { obtenerCreador } from "./creatorTransformer";
import { podcasts } from "@/data/podcasts"; // Import sample data for fallback
import { supabase } from "@/integrations/supabase/client";

/**
 * Transforma un curso de Supabase al modelo de la aplicación
 */
export const transformarCursoAModelo = async (curso: SupabaseCurso): Promise<Podcast> => {
  try {
    console.log(`Transformando curso: ${curso.id} - ${curso.titulo}`);
    
    // Obtener la categoría del curso
    const categoria = await obtenerCategoria(curso.categoria_id);
    
    // Obtener el creador del curso
    const creador = await obtenerCreador(curso.creador_id, curso.id);
    
    // Obtener los módulos y lecciones del curso
    const modulos = await obtenerModulos(curso.id);
    const lecciones = await obtenerLecciones(curso.id);
    
    // Construir el objeto Podcast
    return {
      id: curso.id,
      title: curso.titulo,
      description: curso.descripcion,
      imageUrl: curso.imagen_portada,
      creator: creador,
      category: categoria,
      duration: curso.duracion_total,
      lessonCount: curso.numero_lecciones,
      lessons: lecciones,
      modules: modulos
    };
  } catch (error) {
    console.error(`Error al transformar curso ${curso.id}:`, error);
    
    // Intentar encontrar un podcast de muestra con el mismo ID
    const podcastMuestra = podcasts.find(p => p.id === curso.id);
    if (podcastMuestra) {
      console.log(`Usando datos de muestra para curso ${curso.id}`);
      return podcastMuestra;
    }
    
    // Si no se encuentra, crear un objeto con los datos disponibles
    console.log(`Creando objeto Podcast mínimo para curso ${curso.id}`);
    return {
      id: curso.id,
      title: curso.titulo || "Curso sin título",
      description: curso.descripcion || "Sin descripción",
      imageUrl: curso.imagen_portada || "/placeholder.svg",
      creator: {
        id: "unknown",
        name: "Creador Desconocido",
        imageUrl: "/placeholder.svg",
        socialMedia: []
      },
      category: {
        id: "unknown",
        nombre: "Sin categoría"
      },
      duration: curso.duracion_total || 0,
      lessonCount: curso.numero_lecciones || 0,
      lessons: [],
      modules: []
    };
  }
};

/**
 * Obtiene los módulos para un curso específico
 */
const obtenerModulos = async (cursoId: string): Promise<Module[]> => {
  try {
    console.log(`Obteniendo módulos para curso: ${cursoId}`);
    
    // Consulta para obtener los módulos de la base de datos
    const { data: modulosData, error } = await supabase
      .from('modulos')
      .select('*')
      .eq('curso_id', cursoId)
      .order('orden', { ascending: true });
      
    if (error) {
      console.error(`Error al obtener módulos para curso ${cursoId}:`, error);
      throw error;
    }
    
    if (!modulosData || modulosData.length === 0) {
      console.warn(`No se encontraron módulos para el curso ${cursoId}, usando datos de muestra.`);
      
      // Usar datos de muestra como fallback
      const podcastMuestra = podcasts.find(p => p.id === cursoId);
      if (podcastMuestra) {
        return podcastMuestra.modules;
      }
      
      return [];
    }
    
    // Transformar los datos de Supabase al formato de la aplicación
    console.log(`Se encontraron ${modulosData.length} módulos para el curso ${cursoId}`);
    
    // Obtener las lecciones para cada módulo
    const modulosPromesas = modulosData.map(async (modulo: SupabaseModulo) => {
      // Obtener las lecciones para este módulo
      const { data: leccionesModulo, error: errorLecciones } = await supabase
        .from('lecciones')
        .select('id')
        .eq('modulo_id', modulo.id)
        .order('orden', { ascending: true });
        
      if (errorLecciones) {
        console.error(`Error al obtener lecciones para módulo ${modulo.id}:`, errorLecciones);
        return {
          id: modulo.id,
          title: modulo.titulo,
          lessonIds: []
        };
      }
      
      return {
        id: modulo.id,
        title: modulo.titulo,
        lessonIds: leccionesModulo?.map(leccion => leccion.id) || []
      };
    });
    
    return Promise.all(modulosPromesas);
  } catch (error) {
    console.error(`Error al obtener módulos para curso ${cursoId}:`, error);
    
    // Usar datos de muestra como fallback
    const podcastMuestra = podcasts.find(p => p.id === cursoId);
    if (podcastMuestra) {
      return podcastMuestra.modules;
    }
    
    return [];
  }
};

/**
 * Obtiene las lecciones para un curso específico
 */
const obtenerLecciones = async (cursoId: string): Promise<Lesson[]> => {
  try {
    console.log(`Obteniendo lecciones para curso: ${cursoId}`);
    
    // Primero obtenemos todos los IDs de módulos para este curso
    const { data: modulosData, error: errorModulos } = await supabase
      .from('modulos')
      .select('id')
      .eq('curso_id', cursoId);
      
    if (errorModulos || !modulosData || modulosData.length === 0) {
      console.warn(`No se encontraron módulos para obtener lecciones del curso ${cursoId}, usando datos de muestra.`);
      
      // Usar datos de muestra como fallback
      const podcastMuestra = podcasts.find(p => p.id === cursoId);
      if (podcastMuestra) {
        return podcastMuestra.lessons;
      }
      
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
      console.warn(`No se encontraron lecciones para el curso ${cursoId}, usando datos de muestra.`);
      
      // Usar datos de muestra como fallback
      const podcastMuestra = podcasts.find(p => p.id === cursoId);
      if (podcastMuestra) {
        return podcastMuestra.lessons;
      }
      
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
        duration: leccion.duracion,
        audioUrl: leccion.url_audio,
        isCompleted: false,
        isLocked: leccion.estado_inicial === 'bloqueado' && !isFirstLesson
      };
    });
    
    return lecciones;
  } catch (error) {
    console.error(`Error al obtener lecciones para curso ${cursoId}:`, error);
    
    // Usar datos de muestra como fallback
    const podcastMuestra = podcasts.find(p => p.id === cursoId);
    if (podcastMuestra) {
      return podcastMuestra.lessons;
    }
    
    return [];
  }
};
