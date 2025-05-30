
export interface CategoriaLanding {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string;
  audio_preview_url: string | null;
  orden: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
