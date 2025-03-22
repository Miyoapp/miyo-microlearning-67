
import { Lesson, Module, Podcast, SupabaseCurso, SupabaseLeccion, SupabaseModulo } from "@/types";
import { obtenerCategoriaPorId } from "./categoryTransformer";
import { obtenerCreador } from "./creatorTransformer";
import { podcasts } from "@/data/podcasts"; // Import sample data for fallback

/**
 * Transforma un curso de Supabase al modelo de la aplicación
 */
export const transformarCursoAModelo = async (curso: SupabaseCurso): Promise<Podcast> => {
  try {
    console.log(`Transformando curso: ${curso.id} - ${curso.titulo}`);
    
    // Obtener la categoría del curso
    const categoria = await obtenerCategoriaPorId(curso.categoria_id);
    
    // Obtener el creador del curso
    const creador = await obtenerCreador(curso.creador_id, curso.id);
    
    // Obtener los módulos y lecciones del curso
    const [modulos, lecciones] = await Promise.all([
      obtenerModulos(curso.id),
      obtenerLecciones(curso.id)
    ]);
    
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
    
    // Aquí iría la lógica para obtener los módulos de la base de datos
    // Por ahora, devolvemos un array vacío
    // Ejemplo:
    // const { data, error } = await supabase
    //   .from('modulos')
    //   .select('*')
    //   .eq('curso_id', cursoId)
    //   .order('orden', { ascending: true });
    
    // Usar datos de muestra como fallback
    const podcastMuestra = podcasts.find(p => p.id === cursoId);
    if (podcastMuestra) {
      return podcastMuestra.modules;
    }
    
    return [];
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
    
    // Aquí iría la lógica para obtener las lecciones de la base de datos
    // Por ahora, devolvemos un array vacío
    // Ejemplo:
    // const { data, error } = await supabase
    //   .from('lecciones')
    //   .select('*')
    //   .eq('curso_id', cursoId)
    //   .order('orden', { ascending: true });
    
    // Usar datos de muestra como fallback
    const podcastMuestra = podcasts.find(p => p.id === cursoId);
    if (podcastMuestra) {
      return podcastMuestra.lessons;
    }
    
    return [];
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
