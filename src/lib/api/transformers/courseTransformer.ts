
import { Podcast, SupabaseCurso } from "@/types";
import { obtenerCategoria } from "./categoryTransformer";
import { obtenerCreador } from "./creatorTransformer";
import { obtenerModulos } from "./moduleTransformer";
import { obtenerLecciones } from "./lessonTransformer";
import { podcasts } from "@/data/podcasts";

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
      modules: modulos,
      // Add the new fields including currency
      tipo_curso: curso.tipo_curso as 'libre' | 'pago' | undefined,
      precio: curso.precio,
      moneda: curso.moneda || 'USD',
      likes: curso.likes,
      dislikes: curso.dislikes
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
      modules: [],
      tipo_curso: 'libre',
      precio: 0,
      moneda: 'USD',
      likes: 0,
      dislikes: 0
    };
  }
};
