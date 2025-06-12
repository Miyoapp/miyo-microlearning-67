
export interface CategoryModel {
  id: string;
  nombre: string;
}

export interface CreatorSocialMedia {
  platform: string;
  url: string;
}

export interface CreatorModel {
  id: string;
  name: string;
  imageUrl: string;
  linkedinUrl?: string | null;
  socialMedia?: CreatorSocialMedia[];
}

export interface LessonModel {
  id: string;
  title: string;
  description: string | null;
  urlAudio: string;
  duracion: number;
  orden: number;
  isLocked: boolean;
  isCompleted: boolean;
}

// Add aliases for backward compatibility
export type Lesson = LessonModel;
export type Creator = CreatorModel;

export interface ModuleModel {
  id: string;
  title: string;
  lessonIds: string[];
}

// Add alias for backward compatibility
export type Module = ModuleModel;

export interface Podcast {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: CategoryModel;
  creator: CreatorModel;
  duration: number;
  lessonCount: number;
  lessons: LessonModel[];
  modules?: ModuleModel[];
  tipo_curso: 'libre' | 'pago';
  precio?: number | null;
  moneda?: string | null;
  likes: number;
  dislikes: number;
}

export interface CategoriaLanding {
  id: string;
  nombre: string;
  descripcion: string;
  imagen_url: string;
  audio_preview_url: string;
  orden: number;
}

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
  tipo_curso: 'libre' | 'pago';
  precio?: number | null;
  moneda?: string | null;
  likes: number;
  dislikes: number;
  show?: boolean;
}

// Add missing Supabase types
export interface SupabaseCategoria {
  id: string;
  nombre: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface SupabaseLeccion {
  id: string;
  titulo: string;
  descripcion: string | null;
  url_audio: string;
  duracion: number;
  modulo_id: string;
  orden: number;
  estado_inicial: 'desbloqueado' | 'bloqueado';
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
