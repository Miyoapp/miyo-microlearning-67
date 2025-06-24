
import { Podcast, SupabaseCurso } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { podcasts } from "@/data/podcasts";

// Cache temporal para evitar re-fetch de cursos
const courseCache = new Map<string, { data: Podcast; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Transformar curso con una sola query optimizada usando JOINs
 */
export const transformarCursoOptimizado = async (cursoId: string): Promise<Podcast | null> => {
  try {
    console.log(`🚀 [courseTransformerOptimized] Iniciando carga optimizada del curso: ${cursoId}`);
    
    // Verificar cache primero
    const cached = courseCache.get(cursoId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log(`📋 [courseTransformerOptimized] Usando curso desde cache: ${cached.data.title}`);
      return cached.data;
    }

    // Query única con todos los JOINs necesarios
    const { data: cursoCompleto, error } = await supabase
      .from('cursos')
      .select(`
        *,
        categorias!cursos_categoria_id_fkey (
          id,
          nombre
        ),
        creadores!cursos_creador_id_fkey (
          id,
          nombre,
          imagen_url,
          linkedin_url
        )
      `)
      .eq('id', cursoId)
      .maybeSingle();

    if (error) {
      console.error(`❌ [courseTransformerOptimized] Error en query principal:`, error);
      throw error;
    }

    if (!cursoCompleto) {
      console.warn(`⚠️ [courseTransformerOptimized] Curso no encontrado en DB, buscando en muestra: ${cursoId}`);
      const podcastMuestra = podcasts.find(p => p.id === cursoId);
      return podcastMuestra || null;
    }

    console.log(`✅ [courseTransformerOptimizado] Datos básicos obtenidos para: ${cursoCompleto.titulo}`);

    // Obtener módulos y lecciones en paralelo (pero solo una vez)
    const [modulosData, leccionesData] = await Promise.all([
      obtenerModulosOptimizado(cursoId),
      obtenerLeccionesOptimizado(cursoId)
    ]);

    // Construir el objeto Podcast optimizado
    const podcastTransformado: Podcast = {
      id: cursoCompleto.id,
      title: cursoCompleto.titulo,
      description: cursoCompleto.descripcion,
      imageUrl: cursoCompleto.imagen_portada,
      creator: {
        id: cursoCompleto.creadores?.id || "unknown",
        name: cursoCompleto.creadores?.nombre || "Creador Desconocido",
        imageUrl: cursoCompleto.creadores?.imagen_url || "/placeholder.svg",
        linkedinUrl: cursoCompleto.creadores?.linkedin_url || null,
        socialMedia: [] // Se carga bajo demanda si es necesario
      },
      category: {
        id: cursoCompleto.categorias?.id || "unknown",
        nombre: cursoCompleto.categorias?.nombre || "Sin categoría"
      },
      duration: cursoCompleto.duracion_total || 0,
      lessonCount: cursoCompleto.numero_lecciones || 0,
      lessons: leccionesData,
      modules: modulosData,
      tipo_curso: cursoCompleto.tipo_curso as 'libre' | 'pago' | undefined,
      precio: cursoCompleto.precio,
      moneda: cursoCompleto.moneda || 'USD',
      likes: cursoCompleto.likes || 0,
      dislikes: cursoCompleto.dislikes || 0
    };

    // Guardar en cache
    courseCache.set(cursoId, {
      data: podcastTransformado,
      timestamp: Date.now()
    });

    console.log(`🎯 [courseTransformerOptimizado] Curso transformado y cacheado exitosamente: ${podcastTransformado.title}`);
    return podcastTransformado;

  } catch (error) {
    console.error(`❌ [courseTransformerOptimizado] Error transformando curso ${cursoId}:`, error);
    
    // Fallback a datos de muestra solo en caso de error
    const podcastMuestra = podcasts.find(p => p.id === cursoId);
    if (podcastMuestra) {
      console.log(`🔄 [courseTransformerOptimizado] Usando fallback de muestra para: ${podcastMuestra.title}`);
      return podcastMuestra;
    }
    
    return null;
  }
};

/**
 * Obtener módulos optimizado con una sola query
 */
async function obtenerModulosOptimizado(cursoId: string) {
  try {
    const { data: modulosData, error } = await supabase
      .from('modulos')
      .select(`
        id,
        titulo,
        lecciones!lecciones_modulo_id_fkey (id)
      `)
      .eq('curso_id', cursoId)
      .order('orden', { ascending: true });

    if (error) throw error;

    if (!modulosData || modulosData.length === 0) {
      console.warn(`⚠️ [obtenerModulosOptimizado] No hay módulos para curso ${cursoId}`);
      const podcastMuestra = podcasts.find(p => p.id === cursoId);
      return podcastMuestra?.modules || [];
    }

    return modulosData.map(modulo => ({
      id: modulo.id,
      title: modulo.titulo,
      lessonIds: modulo.lecciones?.map(l => l.id) || []
    }));

  } catch (error) {
    console.error(`❌ [obtenerModulosOptimizado] Error:`, error);
    const podcastMuestra = podcasts.find(p => p.id === cursoId);
    return podcastMuestra?.modules || [];
  }
}

/**
 * Obtener lecciones optimizado con una sola query
 */
async function obtenerLeccionesOptimizado(cursoId: string) {
  try {
    const { data: leccionesData, error } = await supabase
      .from('lecciones')
      .select(`
        *,
        modulos!lecciones_modulo_id_fkey (
          curso_id
        )
      `)
      .eq('modulos.curso_id', cursoId)
      .order('orden', { ascending: true });

    if (error) throw error;

    if (!leccionesData || leccionesData.length === 0) {
      console.warn(`⚠️ [obtenerLeccionesOptimizado] No hay lecciones para curso ${cursoId}`);
      const podcastMuestra = podcasts.find(p => p.id === cursoId);
      return podcastMuestra?.lessons || [];
    }

    return leccionesData.map((leccion, index) => ({
      id: leccion.id,
      title: leccion.titulo,
      duracion: leccion.duracion,
      urlAudio: leccion.url_audio,
      isCompleted: false,
      isLocked: leccion.estado_inicial === 'bloqueado' && index !== 0,
      description: leccion.descripcion,
      orden: leccion.orden
    }));

  } catch (error) {
    console.error(`❌ [obtenerLeccionesOptimizado] Error:`, error);
    const podcastMuestra = podcasts.find(p => p.id === cursoId);
    return podcastMuestra?.lessons || [];
  }
}

/**
 * Limpiar cache (útil para testing o cuando sea necesario)
 */
export const limpiarCacheCursos = () => {
  courseCache.clear();
  console.log('🧹 [courseTransformerOptimizado] Cache de cursos limpiado');
};
