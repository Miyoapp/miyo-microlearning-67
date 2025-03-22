
import { supabase } from "@/integrations/supabase/client";
import { Creator } from "@/types";
import { podcasts } from "@/data/podcasts";

/**
 * Obtiene el creador para un curso específico
 */
export const obtenerCreador = async (creadorId: string, cursoId?: string): Promise<Creator> => {
  try {
    const { data: creadorData, error: creadorError } = await supabase
      .from('creadores')
      .select('*')
      .eq('id', creadorId)
      .maybeSingle();
      
    if (creadorError || !creadorData) {
      console.error("Error al obtener creador:", creadorError);
      
      // Buscar en datos de muestra si existe el curso
      if (cursoId) {
        const sampleCourse = podcasts.find(p => p.id === cursoId);
        if (sampleCourse) {
          console.log("Usando datos de creador de la muestra para curso ID:", cursoId);
          return sampleCourse.creator;
        }
      }
      
      // Creador por defecto si no se encuentra
      return {
        id: creadorId || 'unknown',
        name: 'Creador Desconocido',
        imageUrl: '/placeholder.svg',
        socialMedia: []
      };
    }
    
    // Obtener las redes sociales del creador
    let socialMediaData = [];
    try {
      const { data, error: socialMediaError } = await supabase
        .rpc('get_creator_social_media', { creator_id: creadorData.id });
        
      if (socialMediaError) {
        console.warn("Error al obtener redes sociales, no se mostrarán:", socialMediaError);
      } else {
        socialMediaData = data || [];
      }
    } catch (error) {
      console.error("Error al obtener redes sociales:", error);
    }
    
    // Construir el creador
    return {
      id: creadorData.id,
      name: creadorData.nombre,
      imageUrl: creadorData.imagen_url || '/placeholder.svg',
      socialMedia: socialMediaData
    };
  } catch (error) {
    console.error("Error al procesar creador:", error);
    
    // Buscar en datos de muestra si existe el curso
    if (cursoId) {
      const sampleCourse = podcasts.find(p => p.id === cursoId);
      if (sampleCourse) {
        return sampleCourse.creator;
      }
    }
    
    // Creador por defecto en caso de error
    return {
      id: creadorId || 'unknown',
      name: 'Creador Desconocido',
      imageUrl: '/placeholder.svg',
      socialMedia: []
    };
  }
};
