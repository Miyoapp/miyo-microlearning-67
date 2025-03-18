
export interface Creator {
  id: string;
  name: string;
  imageUrl: string;
  socialMedia?: CreatorSocialMedia[];
}

export interface CreatorSocialMedia {
  platform: string;
  url: string;
}

export interface Podcast {
  id: string;
  title: string;
  creator: Creator;
  duration: number; // in minutes
  lessonCount: number;
  category: CategoryModel;
  imageUrl: string;
  description: string;
  lessons: Lesson[];
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  lessonIds: string[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: number; // in minutes
  audioUrl: string;
  isCompleted: boolean;
  isLocked: boolean;
}

// New CategoryModel interface to match the database table
export interface CategoryModel {
  id: string;
  nombre: string;
}

// Keep the old Category type for backward compatibility
export type Category = 
  | 'Productivity' 
  | 'Business' 
  | 'Technology' 
  | 'Personal Development' 
  | 'Health' 
  | 'Design'
  | 'Marketing';

// Tipos para la integración con Supabase
export interface SupabaseCurso {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_portada: string;
  categoria_id: string;
  creador_id: string;
  duracion_total: number;
  numero_lecciones: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface SupabaseCategoria {
  id: string;
  nombre: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface SupabaseCreador {
  id: string;
  nombre: string;
  imagen_url: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface SupabaseCreadorSocialMedia {
  id: string;
  creador_id: string;
  platform: string;
  url: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface SupabaseModulo {
  id: string;
  titulo: string;
  descripcion: string | null;
  curso_id: string;
  orden: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface SupabaseLeccion {
  id: string;
  titulo: string;
  descripcion: string | null;
  duracion: number;
  url_audio: string;
  modulo_id: string;
  orden: number;
  estado_inicial: 'disponible' | 'bloqueado';
  fecha_creacion: string;
  fecha_actualizacion: string;
}
