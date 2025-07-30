
import { supabase } from "@/integrations/supabase/client";
import { Podcast, SupabaseCurso } from "@/types";
import { podcasts } from "@/data/podcasts"; // Import sample data as fallback
import { transformarCursoAModelo } from './transformers';

// Función para obtener todos los cursos (solo los visibles)
export const obtenerCursos = async (): Promise<Podcast[]> => {
  try {
    console.log("🔄 Fetching courses from Supabase...");
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('show', true); // Filtrar solo cursos visibles
      
    if (error) {
      console.error("❌ Error fetching courses, using sample data:", error);
      return podcasts; // Devolver datos de muestra en caso de error
    }
    
    if (!data || data.length === 0) {
      console.warn("⚠️ No visible courses found in database, using sample data");
      return podcasts; // Devolver datos de muestra si no hay cursos
    }
    
    console.log(`✅ Found ${data.length} visible courses in database`);
    
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
        moneda: curso.moneda || 'USD',
        nivel: (curso as any).nivel, // Type assertion since nivel exists in DB but not in generated types
        likes: curso.likes,
        dislikes: curso.dislikes
      };
      return transformarCursoAModelo(supabaseCurso);
    });
    return Promise.all(promesas);
  } catch (error) {
    console.error("❌ Error fetching courses, using sample data:", error);
    return podcasts; // Devolver datos de muestra en caso de error
  }
};

// Función para obtener un curso por ID (independiente del estado show para permitir acceso directo)
export const obtenerCursoPorId = async (id: string): Promise<Podcast | null> => {
  try {
    console.log(`🔄 [courseAPI] Fetching course with ID: ${id}`);
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Usar maybeSingle en lugar de single para evitar errores
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró el curso, intentar buscar en los datos de muestra
        console.warn(`⚠️ [courseAPI] Course not found in database, searching in sample data for ID: ${id}`);
        const podcastMuestra = podcasts.find(p => p.id === id);
        if (podcastMuestra) {
          console.log(`✅ [courseAPI] Found course in sample data: ${podcastMuestra.title}`);
          return podcastMuestra;
        }
        console.log(`❌ [courseAPI] Course not found in sample data either: ${id}`);
        throw new Error(`Curso no encontrado: ${id}`);
      }
      console.error("❌ [courseAPI] Database error fetching course:", error);
      throw new Error(`Error de base de datos: ${error.message}`);
    }
    
    if (!data) {
      // No se encontró el curso, intentar buscar en los datos de muestra
      console.warn(`⚠️ [courseAPI] Course not found in database, searching in sample data for ID: ${id}`);
      const podcastMuestra = podcasts.find(p => p.id === id);
      if (podcastMuestra) {
        console.log(`✅ [courseAPI] Found course in sample data: ${podcastMuestra.title}`);
        return podcastMuestra;
      }
      console.log(`❌ [courseAPI] Course not found anywhere: ${id}`);
      throw new Error(`Curso no encontrado: ${id}`);
    }
    
    console.log(`✅ [courseAPI] Course found in database: ${data.titulo}`);
    
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
      moneda: data.moneda || 'USD',
      nivel: (data as any).nivel, // Type assertion since nivel exists in DB but not in generated types
      likes: data.likes,
      dislikes: data.dislikes
    };
    
    const transformedCourse = await transformarCursoAModelo(supabaseCurso);
    console.log(`✅ [courseAPI] Course transformed successfully: ${transformedCourse.title}`);
    return transformedCourse;
  } catch (error) {
    console.error(`❌ [courseAPI] Error fetching course ${id}:`, error);
    
    // Final fallback: try sample data
    const podcastMuestra = podcasts.find(p => p.id === id);
    if (podcastMuestra) {
      console.log(`✅ [courseAPI] Found course in sample data as final fallback: ${podcastMuestra.title}`);
      return podcastMuestra;
    }
    
    // If we get here, the course truly doesn't exist
    throw error instanceof Error ? error : new Error(`Error desconocido al cargar curso: ${id}`);
  }
};
