
import { supabase } from "@/integrations/supabase/client";
import { CategoryModel, SupabaseCategoria } from "@/types";
import { podcasts } from "@/data/podcasts"; // Import sample data as fallback

// Función para obtener todas las categorías
export const obtenerCategorias = async (): Promise<CategoryModel[]> => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre');
      
    if (error) {
      console.error("Error al obtener categorías:", error);
      console.log("Utilizando datos de muestra para categorías");
      // Return categories from sample data
      return podcasts.map(podcast => podcast.category).filter((category, index, self) => 
        index === self.findIndex(c => c.id === category.id)
      );
    }
    
    if (!data || data.length === 0) {
      console.warn("No se encontraron categorías en la base de datos, utilizando datos de muestra");
      // Return categories from sample data
      return podcasts.map(podcast => podcast.category).filter((category, index, self) => 
        index === self.findIndex(c => c.id === category.id)
      );
    }
    
    return data.map((cat: SupabaseCategoria) => ({
      id: cat.id,
      nombre: cat.nombre
    }));
  } catch (error) {
    console.error("Error al obtener categorías, usando datos de muestra:", error);
    // Return categories from sample data as fallback
    return podcasts.map(podcast => podcast.category).filter((category, index, self) => 
      index === self.findIndex(c => c.id === category.id)
    );
  }
};
