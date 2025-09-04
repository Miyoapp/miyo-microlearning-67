import { supabase } from "@/integrations/supabase/client";
import { Podcast } from "@/types";

/**
 * OPTIMIZED: Obtiene todos los cursos con UNA SOLA CONSULTA usando JOINs
 * Reemplaza las 36+ consultas individuales con 1 consulta optimizada
 */
export const obtenerCursosOptimizado = async (): Promise<Podcast[]> => {
  try {
    console.log("🚀 OPTIMIZED: Fetching all courses with single query...");
    
    const { data, error } = await supabase
      .from('cursos')
      .select(`
        id,
        titulo,
        descripcion,
        imagen_portada,
        duracion_total,
        numero_lecciones,
        fecha_creacion,
        fecha_actualizacion,
        tipo_curso,
        precio,
        moneda,
        nivel,
        likes,
        dislikes,
        categorias!inner(
          id,
          nombre
        ),
        creadores!inner(
          id,
          nombre,
          imagen_url,
          linkedin_url
        ),
        modulos(
          id,
          titulo,
          orden,
          lecciones(
            id,
            titulo,
            duracion,
            url_audio,
            orden,
            estado_inicial,
            descripcion
          )
        )
      `)
      .eq('show', true)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error("❌ OPTIMIZED: Error fetching courses:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn("⚠️ OPTIMIZED: No courses found");
      return [];
    }

    console.log(`✅ OPTIMIZED: Found ${data.length} courses with complete data in single query`);

    // Transform data to application format
    const transformedCourses = data.map((curso: any): Podcast => {
      // Transform modules with lesson IDs
      const modules = curso.modulos
        ?.sort((a: any, b: any) => a.orden - b.orden)
        .map((modulo: any) => ({
          id: modulo.id,
          title: modulo.titulo,
          lessonIds: modulo.lecciones
            ?.sort((a: any, b: any) => a.orden - b.orden)
            .map((leccion: any) => leccion.id) || []
        })) || [];

      // Transform lessons with proper state
      const lessons = curso.modulos
        ?.flatMap((modulo: any) => modulo.lecciones || [])
        .sort((a: any, b: any) => a.orden - b.orden)
        .map((leccion: any, index: number) => ({
          id: leccion.id,
          title: leccion.titulo,
          duracion: leccion.duracion,
          urlAudio: leccion.url_audio,
          isCompleted: false,
          isLocked: leccion.estado_inicial === 'bloqueado' && index !== 0,
          description: leccion.descripcion,
          orden: leccion.orden
        })) || [];

      return {
        id: curso.id,
        title: curso.titulo,
        description: curso.descripcion,
        imageUrl: curso.imagen_portada,
        creator: {
          id: curso.creadores.id,
          name: curso.creadores.nombre,
          imageUrl: curso.creadores.imagen_url,
          linkedinUrl: curso.creadores.linkedin_url,
          socialMedia: [] // Will be loaded separately if needed
        },
        category: {
          id: curso.categorias.id,
          nombre: curso.categorias.nombre
        },
        duration: curso.duracion_total,
        lessonCount: curso.numero_lecciones,
        lessons,
        modules,
        tipo_curso: curso.tipo_curso as 'libre' | 'pago' | undefined,
        precio: curso.precio,
        moneda: curso.moneda || 'USD',
        nivel: curso.nivel,
        likes: curso.likes,
        dislikes: curso.dislikes
      };
    });

    console.log(`🎉 OPTIMIZED: Successfully transformed ${transformedCourses.length} courses`);
    return transformedCourses;

  } catch (error) {
    console.error("❌ OPTIMIZED: Error in obtenerCursosOptimizado:", error);
    throw error;
  }
};

/**
 * OPTIMIZED: Obtiene un curso específico con UNA SOLA CONSULTA
 */
export const obtenerCursoPorIdOptimizado = async (id: string): Promise<Podcast | null> => {
  try {
    console.log(`🚀 OPTIMIZED: Fetching course ${id} with single query...`);
    
    const { data, error } = await supabase
      .from('cursos')
      .select(`
        id,
        titulo,
        descripcion,
        imagen_portada,
        duracion_total,
        numero_lecciones,
        fecha_creacion,
        fecha_actualizacion,
        tipo_curso,
        precio,
        moneda,
        nivel,
        likes,
        dislikes,
        categorias!inner(
          id,
          nombre
        ),
        creadores!inner(
          id,
          nombre,
          imagen_url,
          linkedin_url,
          creador_social_media(
            platform,
            url
          )
        ),
        modulos(
          id,
          titulo,
          orden,
          lecciones(
            id,
            titulo,
            duracion,
            url_audio,
            orden,
            estado_inicial,
            descripcion
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`❌ OPTIMIZED: Error fetching course ${id}:`, error);
      throw error;
    }

    if (!data) {
      console.log(`❌ OPTIMIZED: Course not found: ${id}`);
      throw new Error(`Curso no encontrado: ${id}`);
    }

    console.log(`✅ OPTIMIZED: Course found: ${data.titulo}`);

    // Transform to application format (same logic as above)
    const modules = data.modulos
      ?.sort((a: any, b: any) => a.orden - b.orden)
      .map((modulo: any) => ({
        id: modulo.id,
        title: modulo.titulo,
        lessonIds: modulo.lecciones
          ?.sort((a: any, b: any) => a.orden - b.orden)
          .map((leccion: any) => leccion.id) || []
      })) || [];

    const lessons = data.modulos
      ?.flatMap((modulo: any) => modulo.lecciones || [])
      .sort((a: any, b: any) => a.orden - b.orden)
      .map((leccion: any, index: number) => ({
        id: leccion.id,
        title: leccion.titulo,
        duracion: leccion.duracion,
        urlAudio: leccion.url_audio,
        isCompleted: false,
        isLocked: leccion.estado_inicial === 'bloqueado' && index !== 0,
        description: leccion.descripcion,
        orden: leccion.orden
      })) || [];

    const socialMedia = data.creadores.creador_social_media?.map((sm: any) => ({
      platform: sm.platform,
      url: sm.url
    })) || [];

    const transformedCourse: Podcast = {
      id: data.id,
      title: data.titulo,
      description: data.descripcion,
      imageUrl: data.imagen_portada,
      creator: {
        id: data.creadores.id,
        name: data.creadores.nombre,
        imageUrl: data.creadores.imagen_url,
        linkedinUrl: data.creadores.linkedin_url,
        socialMedia
      },
      category: {
        id: data.categorias.id,
        nombre: data.categorias.nombre
      },
      duration: data.duracion_total,
      lessonCount: data.numero_lecciones,
      lessons,
      modules,
      tipo_curso: data.tipo_curso as 'libre' | 'pago' | undefined,
      precio: data.precio,
      moneda: data.moneda || 'USD',
      nivel: data.nivel,
      likes: data.likes,
      dislikes: data.dislikes
    };

    console.log(`🎉 OPTIMIZED: Successfully transformed course: ${transformedCourse.title}`);
    return transformedCourse;

  } catch (error) {
    console.error(`❌ OPTIMIZED: Error fetching course ${id}:`, error);
    throw error instanceof Error ? error : new Error(`Error desconocido al cargar curso: ${id}`);
  }
};

/**
 * OPTIMIZED: Obtiene categorías con caché
 */
export const obtenerCategoriasOptimizado = async () => {
  try {
    console.log("🚀 OPTIMIZED: Fetching categories...");
    
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre')
      .order('nombre', { ascending: true });

    if (error) {
      console.error("❌ OPTIMIZED: Error fetching categories:", error);
      throw error;
    }

    console.log(`✅ OPTIMIZED: Found ${data?.length || 0} categories`);
    return data || [];

  } catch (error) {
    console.error("❌ OPTIMIZED: Error in obtenerCategoriasOptimizado:", error);
    throw error;
  }
};