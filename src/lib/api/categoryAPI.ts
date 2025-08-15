
import { supabase } from "@/integrations/supabase/client";
import { CategoryModel, SupabaseCategoria } from "@/types";

// Función para obtener todas las categorías
export const obtenerCategorias = async (): Promise<CategoryModel[]> => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre');
      
    if (error) {
      console.error("Error al obtener categorías:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn("No se encontraron categorías en la base de datos");
      return [];
    }
    
    return data.map((cat: SupabaseCategoria) => ({
      id: cat.id,
      nombre: cat.nombre
    }));
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    throw error;
  }
};
