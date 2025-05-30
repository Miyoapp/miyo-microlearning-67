
import { supabase } from "@/integrations/supabase/client";
import { CategoriaLanding } from "@/types/landing";

export const obtenerCategoriasLanding = async (): Promise<CategoriaLanding[]> => {
  try {
    const { data, error } = await supabase
      .from('categoria_landing')
      .select('*')
      .order('orden');
      
    if (error) {
      console.error("Error al obtener categorías del landing:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error al obtener categorías del landing:", error);
    return [];
  }
};
