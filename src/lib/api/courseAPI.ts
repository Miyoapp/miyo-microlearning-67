
import { supabase } from "@/integrations/supabase/client";
import { Podcast, SupabaseCurso } from "@/types";
import { podcasts } from "@/data/podcasts"; // Import sample data as fallback
import { transformarCursoAModelo } from './transformers';

// Función para obtener todos los cursos
export const obtenerCursos = async (): Promise<Podcast[]> => {
  try {
    console.log("Obteniendo cursos desde Supabase...");
    const { data, error } = await supabase
      .from('cursos')
      .select('*');
      
    if (error) {
      console.error("Error al obtener cursos, usando datos de muestra:", error);
      return podcasts; // Devolver datos de muestra en caso de error
    }
    
    if (!data || data.length === 0) {
      console.warn("No se encontraron cursos en la base de datos, utilizando datos de muestra");
      return podcasts; // Devolver datos de muestra si no hay cursos
    }
    
    console.log(`Se encontraron ${data.length} cursos en la base de datos`);
    
    // Transform each course to the application format
    const promesas = data.map((curso) => {
      // Cast the curso to SupabaseCurso to handle type compatibility
      const supabaseCurso: SupabaseCurso = {
        id: curso.id,
        titulo: curso.titulo,
        descripcion: curso.descripcion,
        imagen_portada: curso.imagen_portada,
        categoria_id: curso.categoria_id,
        creador_id: curso.creador_id,
        duracion_total: curso.duracion_total,
        numero_lecciones: curso.numero_lecciones,
        fecha_creacion: curso.fecha_creacion,
        fecha_actualizacion: curso.fecha_actualizacion,
        tipo_curso: (curso.tipo_curso as 'libre' | 'pago') || 'libre',
        precio: curso.precio,
        likes: curso.likes,
        dislikes: curso.dislikes
      };
      return transformarCursoAModelo(supabaseCurso);
    });
    return Promise.all(promesas);
  } catch (error) {
    console.error("Error al obtener cursos, usando datos de muestra:", error);
    return podcasts; // Devolver datos de muestra en caso de error
  }
};

// Función para obtener un curso por ID
export const obtenerCursoPorId = async (id: string): Promise<Podcast | null> => {
  try {
    console.log(`Obteniendo curso con ID: ${id}`);
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Usar maybeSingle en lugar de single para evitar errores
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró el curso, intentar buscar en los datos de muestra
        console.warn("No se encontró el curso en la base de datos, buscando en datos de muestra");
        const podcastMuestra = podcasts.find(p => p.id === id);
        return podcastMuestra || null;
      }
      console.error("Error al obtener curso:", error);
      throw error;
    }
    
    if (!data) {
      // No se encontró el curso, intentar buscar en los datos de muestra
      console.warn("No se encontró el curso en la base de datos, buscando en datos de muestra");
      const podcastMuestra = podcasts.find(p => p.id === id);
      return podcastMuestra || null;
    }
    
    // Cast the data to SupabaseCurso to handle type compatibility
    const supabaseCurso: SupabaseCurso = {
      id: data.id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      imagen_portada: data.imagen_portada,
      categoria_id: data.categoria_id,
      creador_id: data.creador_id,
      duracion_total: data.duracion_total,
      numero_lecciones: data.numero_lecciones,
      fecha_creacion: data.fecha_creacion,
      fecha_actualizacion: data.fecha_actualizacion,
      tipo_curso: (data.tipo_curso as 'libre' | 'pago') || 'libre',
      precio: data.precio,
      likes: data.likes,
      dislikes: data.dislikes
    };
    
    return transformarCursoAModelo(supabaseCurso);
  } catch (error) {
    console.error("Error al obtener curso, buscando en datos de muestra:", error);
    // Intentar buscar en los datos de muestra
    const podcastMuestra = podcasts.find(p => p.id === id);
    return podcastMuestra || null;
  }
};
