
import { supabase } from "@/integrations/supabase/client";
import { CategoryModel } from "@/types";
import { podcasts } from "@/data/podcasts";

/**
 * Obtiene la categoría para un curso específico
 */
export const obtenerCategoria = async (categoriaId: string): Promise<CategoryModel> => {
  try {
    const { data: categoriaData, error: categoriaError } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', categoriaId)
      .maybeSingle();
      
    if (categoriaError || !categoriaData) {
      console.warn("Error al obtener categoría, usando valor por defecto:", categoriaError);
      
      // Buscar la categoría en datos de muestra
      const sampleCategory = podcasts
        .map(p => p.category)
        .find(c => c.id === categoriaId);
      
      if (sampleCategory) {
        return sampleCategory;
      }
      
      // Categoría por defecto si no se encuentra
      return {
        id: categoriaId || 'unknown',
        nombre: 'Categoría Desconocida'
      };
    }
    
    return {
      id: categoriaData.id,
      nombre: categoriaData.nombre
    };
  } catch (error) {
    console.error("Error al procesar categoría:", error);
    
    // Categoría por defecto en caso de error
    return {
      id: categoriaId || 'unknown',
      nombre: 'Categoría Desconocida'
    };
  }
};
