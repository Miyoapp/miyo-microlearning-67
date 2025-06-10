
import { supabase } from "@/integrations/supabase/client";
import { Creator } from "@/types";
import { podcasts } from "@/data/podcasts";

/**
 * Obtiene el creador para un curso específico
 */
export const obtenerCreador = async (creadorId: string, cursoId?: string): Promise<Creator> => {
  try {
    console.log(`Obteniendo creador con ID: ${creadorId} para curso: ${cursoId || 'no especificado'}`);
    
    // Verificar si el ID del creador es válido
    if (!creadorId || creadorId === 'unknown') {
      console.warn("ID de creador no válido:", creadorId);
      return buscarCreadorEnDatosDeMuestra(cursoId) || crearCreadorPorDefecto(creadorId);
    }
    
    const { data: creadorData, error: creadorError } = await supabase
      .from('creadores')
      .select('*')
      .eq('id', creadorId)
      .maybeSingle();
      
    if (creadorError) {
      console.error("Error al obtener creador de Supabase:", creadorError);
      return buscarCreadorEnDatosDeMuestra(cursoId) || crearCreadorPorDefecto(creadorId);
    }
    
    if (!creadorData) {
      console.warn(`No se encontró el creador con ID: ${creadorId} en la base de datos`);
      return buscarCreadorEnDatosDeMuestra(cursoId) || crearCreadorPorDefecto(creadorId);
    }
    
    console.log("Datos de creador obtenidos correctamente:", creadorData.nombre);
    
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
      linkedin_url: creadorData.linkedin_url,
      socialMedia: socialMediaData
    };
  } catch (error) {
    console.error("Error al procesar creador:", error);
    return buscarCreadorEnDatosDeMuestra(cursoId) || crearCreadorPorDefecto(creadorId);
  }
};

/**
 * Busca un creador en los datos de muestra para un curso específico
 */
const buscarCreadorEnDatosDeMuestra = (cursoId?: string): Creator | null => {
  if (!cursoId) return null;
  
  const sampleCourse = podcasts.find(p => p.id === cursoId);
  if (sampleCourse) {
    console.log("Usando datos de creador de la muestra para curso ID:", cursoId);
    return sampleCourse.creator;
  }
  
  return null;
};

/**
 * Crea un objeto creador por defecto
 */
const crearCreadorPorDefecto = (creadorId?: string): Creator => {
  return {
    id: creadorId || 'unknown',
    name: 'Creador Desconocido',
    imageUrl: '/placeholder.svg',
    socialMedia: []
  };
};
