import { supabase } from "@/integrations/supabase/client";
import { 
  Podcast, 
  Module, 
  Lesson, 
  Creator,
  CreatorSocialMedia,
  SupabaseCurso, 
  SupabaseModulo, 
  SupabaseLeccion,
  SupabaseCategoria,
  SupabaseCreador,
  CategoryModel
} from "@/types";

// Función para obtener todas las categorías
export const obtenerCategorias = async (): Promise<CategoryModel[]> => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre');
    
  if (error) {
    console.error("Error al obtener categorías:", error);
    throw error;
  }
  
  return data.map((cat: SupabaseCategoria) => ({
    id: cat.id,
    nombre: cat.nombre
  }));
};

// Convertir datos de Supabase al formato de la aplicación
export const transformarCursoAModelo = async (curso: SupabaseCurso): Promise<Podcast> => {
  // Obtener la categoría para este curso
  const { data: categoriaData, error: categoriaError } = await supabase
    .from('categorias')
    .select('*')
    .eq('id', curso.categoria_id)
    .single();
    
  if (categoriaError) {
    console.error("Error al obtener categoría:", categoriaError);
    throw categoriaError;
  }
  
  const categoria: CategoryModel = {
    id: categoriaData.id,
    nombre: categoriaData.nombre
  };
  
  // Obtener el creador para este curso
  const { data: creadorData, error: creadorError } = await supabase
    .from('creadores')
    .select('*')
    .eq('id', curso.creador_id)
    .single();
    
  if (creadorError) {
    console.error("Error al obtener creador:", creadorError);
    throw creadorError;
  }
  
  // Obtener las redes sociales del creador
  const { data: socialMediaData, error: socialMediaError } = await supabase
    .rpc('get_creator_social_media', { creator_id: creadorData.id });
    
  if (socialMediaError) {
    console.error("Error al obtener redes sociales:", socialMediaError);
    // No lanzamos error aquí, simplemente no mostramos redes sociales
  }
  
  // Construir el creador
  const creator: Creator = {
    id: creadorData.id,
    name: creadorData.nombre,
    imageUrl: creadorData.imagen_url,
    socialMedia: socialMediaData || []
  };
  
  // Obtener módulos para este curso
  const { data: modulos, error: modulosError } = await supabase
    .from('modulos')
    .select('*')
    .eq('curso_id', curso.id)
    .order('orden');
    
  if (modulosError) {
    console.error("Error al obtener módulos:", modulosError);
    throw modulosError;
  }
  
  // Obtener lecciones para todos los módulos de este curso
  const moduloIds = modulos.map(m => m.id);
  const { data: leccionesData, error: leccionesError } = await supabase
    .from('lecciones')
    .select('*')
    .in('modulo_id', moduloIds)
    .order('orden');
    
  if (leccionesError) {
    console.error("Error al obtener lecciones:", leccionesError);
    throw leccionesError;
  }
  
  // Convertir lecciones al formato esperado
  const lecciones: Lesson[] = leccionesData.map((l: SupabaseLeccion) => ({
    id: l.id,
    title: l.titulo,
    duration: l.duracion,
    audioUrl: l.url_audio,
    isCompleted: false, // Estado inicial
    isLocked: l.estado_inicial === 'bloqueado'
  }));
  
  // Crear un mapa de lecciones por módulo
  const leccionesPorModulo: Record<string, string[]> = {};
  leccionesData.forEach((l: SupabaseLeccion) => {
    if (!leccionesPorModulo[l.modulo_id]) {
      leccionesPorModulo[l.modulo_id] = [];
    }
    leccionesPorModulo[l.modulo_id].push(l.id);
  });
  
  // Construir módulos
  const modulosTransformados: Module[] = modulos.map((m: SupabaseModulo) => ({
    id: m.id,
    title: m.titulo,
    lessonIds: leccionesPorModulo[m.id] || []
  }));
  
  // Construir el podcast (curso)
  return {
    id: curso.id,
    title: curso.titulo,
    creator: creator,
    duration: curso.duracion_total,
    lessonCount: curso.numero_lecciones,
    category: categoria,
    imageUrl: curso.imagen_portada,
    description: curso.descripcion,
    lessons: lecciones,
    modules: modulosTransformados
  };
};

// Función para obtener todos los cursos
export const obtenerCursos = async (): Promise<Podcast[]> => {
  const { data, error } = await supabase
    .from('cursos')
    .select('*');
    
  if (error) {
    console.error("Error al obtener cursos:", error);
    throw error;
  }
  
  // Transformar cada curso al formato de la aplicación
  const promesas = data.map((curso: SupabaseCurso) => transformarCursoAModelo(curso));
  return Promise.all(promesas);
};

// Función para obtener un curso por ID
export const obtenerCursoPorId = async (id: string): Promise<Podcast | null> => {
  const { data, error } = await supabase
    .from('cursos')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // No se encontró el curso
      return null;
    }
    console.error("Error al obtener curso:", error);
    throw error;
  }
  
  if (!data) return null;
  
  return transformarCursoAModelo(data);
};
