
import { Podcast } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { podcasts } from "@/data/podcasts";

/**
 * Transformer simplificado para carga inicial rápida
 * Solo obtiene datos básicos del curso sin relaciones complejas
 */
export const transformarCursoSimplificado = async (cursoId: string): Promise<Podcast | null> => {
  console.log(`🚀 [courseTransformerSimplified] Iniciando carga simplificada del curso: ${cursoId}`);
  
  try {
    // Step 1: Obtener solo datos básicos del curso
    console.log(`📊 [courseTransformerSimplified] Obteniendo datos básicos del curso...`);
    const { data: curso, error: cursoError } = await supabase
      .from('cursos')
      .select('*')
      .eq('id', cursoId)
      .maybeSingle();

    if (cursoError) {
      console.error(`❌ [courseTransformerSimplified] Error en query curso:`, cursoError);
      throw cursoError;
    }

    if (!curso) {
      console.warn(`⚠️ [courseTransformerSimplified] Curso no encontrado en DB: ${cursoId}`);
      // Buscar en datos de muestra como fallback
      const podcastMuestra = podcasts.find(p => p.id === cursoId);
      if (podcastMuestra) {
        console.log(`🔄 [courseTransformerSimplified] Usando datos de muestra para: ${podcastMuestra.title}`);
        return podcastMuestra;
      }
      return null;
    }

    console.log(`✅ [courseTransformerSimplified] Curso básico obtenido: ${curso.titulo}`);

    // Step 2: Obtener categoría (simple)
    console.log(`📊 [courseTransformerSimplified] Obteniendo categoría...`);
    const { data: categoria } = await supabase
      .from('categorias')
      .select('id, nombre')
      .eq('id', curso.categoria_id)
      .maybeSingle();

    // Step 3: Obtener creador (simple)
    console.log(`📊 [courseTransformerSimplified] Obteniendo creador...`);
    const { data: creador } = await supabase
      .from('creadores')
      .select('id, nombre, imagen_url, linkedin_url')
      .eq('id', curso.creador_id)
      .maybeSingle();

    // Step 4: Obtener lecciones básicas (sin joins complejos)
    console.log(`📊 [courseTransformerSimplified] Obteniendo lecciones básicas...`);
    const { data: modulos } = await supabase
      .from('modulos')
      .select('id, titulo, orden')
      .eq('curso_id', cursoId)
      .order('orden', { ascending: true });

    const { data: lecciones } = await supabase
      .from('lecciones')
      .select(`
        id,
        titulo,
        descripcion,
        duracion,
        url_audio,
        orden,
        estado_inicial,
        modulo_id
      `)
      .in('modulo_id', modulos?.map(m => m.id) || [])
      .order('orden', { ascending: true });

    console.log(`📊 [courseTransformerSimplified] Datos obtenidos - Módulos: ${modulos?.length || 0}, Lecciones: ${lecciones?.length || 0}`);

    // Step 5: Construir objeto simplificado
    const leccionesTransformadas = (lecciones || []).map((leccion, index) => ({
      id: leccion.id,
      title: leccion.titulo,
      duracion: leccion.duracion,
      urlAudio: leccion.url_audio,
      isCompleted: false,
      isLocked: leccion.estado_inicial === 'bloqueado' && index !== 0,
      description: leccion.descripcion,
      orden: leccion.orden
    }));

    const modulosTransformados = (modulos || []).map(modulo => {
      const lessonIds = (lecciones || [])
        .filter(l => l.modulo_id === modulo.id)
        .map(l => l.id);
      
      return {
        id: modulo.id,
        title: modulo.titulo,
        lessonIds
      };
    });

    const podcastTransformado: Podcast = {
      id: curso.id,
      title: curso.titulo,
      description: curso.descripcion,
      imageUrl: curso.imagen_portada,
      creator: {
        id: creador?.id || "unknown",
        name: creador?.nombre || "Creador Desconocido",
        imageUrl: creador?.imagen_url || "/placeholder.svg",
        linkedinUrl: creador?.linkedin_url || null,
        socialMedia: []
      },
      category: {
        id: categoria?.id || "unknown",
        nombre: categoria?.nombre || "Sin categoría"
      },
      duration: curso.duracion_total || 0,
      lessonCount: curso.numero_lecciones || 0,
      lessons: leccionesTransformadas,
      modules: modulosTransformados,
      tipo_curso: curso.tipo_curso as 'libre' | 'pago' | undefined,
      precio: curso.precio,
      moneda: curso.moneda || 'USD',
      likes: curso.likes || 0,
      dislikes: curso.dislikes || 0
    };

    console.log(`🎯 [courseTransformerSimplified] Curso transformado exitosamente: ${podcastTransformado.title}`);
    return podcastTransformado;

  } catch (error) {
    console.error(`❌ [courseTransformerSimplified] Error transformando curso ${cursoId}:`, error);
    
    // Fallback robusto a datos de muestra
    const podcastMuestra = podcasts.find(p => p.id === cursoId);
    if (podcastMuestra) {
      console.log(`🔄 [courseTransformerSimplified] Usando fallback de muestra para: ${podcastMuestra.title}`);
      return podcastMuestra;
    }
    
    return null;
  }
};
