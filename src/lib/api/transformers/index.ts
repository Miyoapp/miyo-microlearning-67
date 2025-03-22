
import { Podcast, SupabaseCurso } from "@/types";
import { podcasts } from "@/data/podcasts";
import { obtenerCategoria } from "./categoryTransformer";
import { obtenerCreador } from "./creatorTransformer";
import { obtenerContenidoCurso } from "./contentTransformer";

/**
 * Convertir datos de Supabase al formato de la aplicación
 * Función principal para transformar un curso de Supabase al modelo de la aplicación
 */
export const transformarCursoAModelo = async (curso: SupabaseCurso): Promise<Podcast> => {
  try {
    // Obtener la categoría para este curso
    const categoria = await obtenerCategoria(curso.categoria_id);
    
    // Obtener el creador para este curso
    const creator = await obtenerCreador(curso.creador_id, curso.id);
    
    // Obtener módulos y lecciones para este curso
    const { modulos: modulosTransformados, lecciones } = await obtenerContenidoCurso(curso.id);
    
    // Construir el podcast (curso)
    return {
      id: curso.id,
      title: curso.titulo,
      creator: creator,
      duration: curso.duracion_total,
      lessonCount: curso.numero_lecciones || lecciones.length,
      category: categoria,
      imageUrl: curso.imagen_portada || '/placeholder.svg',
      description: curso.descripcion,
      lessons: lecciones,
      modules: modulosTransformados
    };
  } catch (error) {
    console.error("Error al transformar curso, devolviendo una versión simplificada:", error);
    
    // Intentar encontrar el curso en los datos de muestra
    const sampleCourse = podcasts.find(p => p.id === curso.id);
    if (sampleCourse) {
      console.log("Usando datos de muestra completos para:", curso.titulo);
      return sampleCourse;
    }
    
    // Crear una versión simplificada del curso en caso de error
    return {
      id: curso.id,
      title: curso.titulo,
      creator: {
        id: 'unknown',
        name: 'Creador Desconocido',
        imageUrl: '/placeholder.svg',
        socialMedia: []
      },
      duration: curso.duracion_total || 0,
      lessonCount: curso.numero_lecciones || 0,
      category: {
        id: curso.categoria_id || 'unknown',
        nombre: 'Categoría Desconocida'
      },
      imageUrl: curso.imagen_portada || '/placeholder.svg',
      description: curso.descripcion || 'Sin descripción disponible',
      lessons: [],
      modules: []
    };
  }
};
