
export interface Creator {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Podcast {
  id: string;
  title: string;
  creator: Creator;
  duration: number; // in minutes
  lessonCount: number;
  category: Category;
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
  categoria: string;
  creador_nombre: string;
  creador_imagen: string;
  duracion_total: number;
  numero_lecciones: number;
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
