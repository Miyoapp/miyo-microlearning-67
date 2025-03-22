
import { supabase } from "@/integrations/supabase/client";
import { 
  Podcast, 
  Module, 
  Lesson, 
  Creator,
  CategoryModel,
  SupabaseCurso, 
  SupabaseModulo, 
  SupabaseLeccion
} from "@/types";
import { podcasts } from "@/data/podcasts"; // Import sample data as fallback

// Convertir datos de Supabase al formato de la aplicación
export const transformarCursoAModelo = async (curso: SupabaseCurso): Promise<Podcast> => {
  try {
    // Obtener la categoría para este curso
    const { data: categoriaData, error: categoriaError } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', curso.categoria_id)
      .maybeSingle();
      
    let categoria: CategoryModel;
    if (categoriaError) {
      console.warn("Error al obtener categoría, usando valor por defecto:", categoriaError);
      categoria = {
        id: curso.categoria_id,
        nombre: 'Categoría Desconocida'
      };
    } else {
      categoria = {
        id: categoriaData.id,
        nombre: categoriaData.nombre
      };
    }
    
    // Obtener el creador para este curso
    const { data: creadorData, error: creadorError } = await supabase
      .from('creadores')
      .select('*')
      .eq('id', curso.creador_id)
      .maybeSingle();
      
    let creator: Creator;
    if (creadorError) {
      console.error("Error al obtener creador:", creadorError);
      
      // Buscar en datos de muestra si existe el curso
      const sampleCourse = podcasts.find(p => p.id === curso.id);
      if (sampleCourse) {
        console.log("Usando datos de creador de la muestra para:", curso.titulo);
        creator = sampleCourse.creator;
      } else {
        creator = {
          id: curso.creador_id || 'unknown',
          name: 'Creador Desconocido',
          imageUrl: '/placeholder.svg',
          socialMedia: []
        };
      }
    } else {
      // Obtener las redes sociales del creador
      const { data: socialMediaData, error: socialMediaError } = await supabase
        .rpc('get_creator_social_media', { creator_id: creadorData.id });
        
      if (socialMediaError) {
        console.warn("Error al obtener redes sociales, no se mostrarán:", socialMediaError);
      }
      
      // Construir el creador
      creator = {
        id: creadorData.id,
        name: creadorData.nombre,
        imageUrl: creadorData.imagen_url || '/placeholder.svg',
        socialMedia: socialMediaData || []
      };
    }
    
    // Obtener módulos para este curso
    const { data: modulos, error: modulosError } = await supabase
      .from('modulos')
      .select('*')
      .eq('curso_id', curso.id)
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
    
    // Si no hay lecciones, crear algunas de ejemplo
    if (lecciones.length === 0) {
      lecciones = [
        {
          id: `${curso.id}-lesson-1`,
          title: "Introducción al curso",
          duration: 5,
          audioUrl: "https://example.com/audio1.mp3",
          isCompleted: false,
          isLocked: false
        },
        {
          id: `${curso.id}-lesson-2`,
          title: "Conceptos básicos",
          duration: 10,
          audioUrl: "https://example.com/audio2.mp3",
          isCompleted: false,
          isLocked: true
        }
      ];
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
      // Crear módulos por defecto si no hay
      modulosTransformados = [
        {
          id: `${curso.id}-module-1`,
          title: 'Conceptos Básicos',
          lessonIds: lecciones.map(l => l.id)
        }
      ];
    }
    
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
        imageUrl: '/placeholder.svg'
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
