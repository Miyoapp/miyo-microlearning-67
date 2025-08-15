
import { Module, SupabaseModulo } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Obtiene los módulos para un curso específico
 */
export const obtenerModulos = async (cursoId: string): Promise<Module[]> => {
  try {
    console.log(`Obteniendo módulos para curso: ${cursoId}`);
    
    // Consulta para obtener los módulos de la base de datos
    const { data: modulosData, error } = await supabase
      .from('modulos')
      .select('*')
      .eq('curso_id', cursoId)
      .order('orden', { ascending: true });
      
    if (error) {
      console.error(`Error al obtener módulos para curso ${cursoId}:`, error);
      throw error;
    }
    
    if (!modulosData || modulosData.length === 0) {
      console.warn(`No se encontraron módulos para el curso ${cursoId}`);
      return [];
    }
    
    // Transformar los datos de Supabase al formato de la aplicación
    console.log(`Se encontraron ${modulosData.length} módulos para el curso ${cursoId}`);
    
    // Obtener las lecciones para cada módulo
    const modulosPromesas = modulosData.map(async (modulo: SupabaseModulo) => {
      // Obtener las lecciones para este módulo
      const { data: leccionesModulo, error: errorLecciones } = await supabase
        .from('lecciones')
        .select('id')
        .eq('modulo_id', modulo.id)
        .order('orden', { ascending: true });
        
      if (errorLecciones) {
        console.error(`Error al obtener lecciones para módulo ${modulo.id}:`, errorLecciones);
        return {
          id: modulo.id,
          title: modulo.titulo,
          lessonIds: []
        };
      }
      
      return {
        id: modulo.id,
        title: modulo.titulo,
        lessonIds: leccionesModulo?.map(leccion => leccion.id) || []
      };
    });
    
    return Promise.all(modulosPromesas);
  } catch (error) {
    console.error(`Error al obtener módulos para curso ${cursoId}:`, error);
    return [];
  }
};
