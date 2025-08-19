
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categoria_landing: {
        Row: {
          audio_preview_url: string | null
          descripcion: string | null
          fecha_actualizacion: string
          fecha_creacion: string
          id: string
          imagen_url: string
          nombre: string
          orden: number
        }
        Insert: {
          audio_preview_url?: string | null
          descripcion?: string | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          imagen_url: string
          nombre: string
          orden: number
        }
        Update: {
          audio_preview_url?: string | null
          descripcion?: string | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          imagen_url?: string
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      categorias: {
        Row: {
          fecha_actualizacion: string
          fecha_creacion: string
          id: string
          nombre: string
        }
        Insert: {
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          nombre: string
        }
        Update: {
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      compras_cursos: {
        Row: {
          created_at: string | null
          curso_id: string | null
          estado_pago: string | null
          fecha_compra: string | null
          id: string
          monto_pagado: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          curso_id?: string | null
          estado_pago?: string | null
          fecha_compra?: string | null
          id?: string
          monto_pagado?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          curso_id?: string | null
          estado_pago?: string | null
          fecha_compra?: string | null
          id?: string
          monto_pagado?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      creador_social_media: {
        Row: {
          creador_id: string
          fecha_actualizacion: string
          fecha_creacion: string
          id: string
          platform: string
          url: string
        }
        Insert: {
          creador_id: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          platform: string
          url: string
        }
        Update: {
          creador_id?: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          platform?: string
          url?: string
        }
        Relationships: []
      }
      creadores: {
        Row: {
          fecha_actualizacion: string
          fecha_creacion: string
          id: string
          imagen_url: string
          linkedin_url: string | null
          nombre: string
        }
        Insert: {
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          imagen_url: string
          linkedin_url?: string | null
          nombre: string
        }
        Update: {
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          imagen_url?: string
          linkedin_url?: string | null
          nombre?: string
        }
        Relationships: []
      }
      curso_votos: {
        Row: {
          created_at: string | null
          curso_id: string | null
          id: string
          tipo_voto: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          curso_id?: string | null
          id?: string
          tipo_voto?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          curso_id?: string | null
          id?: string
          tipo_voto?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cursos: {
        Row: {
          categoria_id: string
          creador_id: string
          descripcion: string
          dislikes: number
          duracion_total: number
          fecha_actualizacion: string
          fecha_creacion: string
          id: string
          imagen_portada: string
          likes: number
          moneda: string | null
          nivel: string | null
          numero_lecciones: number
          precio: number | null
          show: boolean
          tipo_curso: string | null
          titulo: string
        }
        Insert: {
          categoria_id: string
          creador_id: string
          descripcion: string
          dislikes?: number
          duracion_total: number
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          imagen_portada: string
          likes?: number
          moneda?: string | null
          nivel?: string | null
          numero_lecciones?: number
          precio?: number | null
          show?: boolean
          tipo_curso?: string | null
          titulo: string
        }
        Update: {
          categoria_id?: string
          creador_id?: string
          descripcion?: string
          dislikes?: number
          duracion_total?: number
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          imagen_portada?: string
          likes?: number
          moneda?: string | null
          nivel?: string | null
          numero_lecciones?: number
          precio?: number | null
          show?: boolean
          tipo_curso?: string | null
          titulo?: string
        }
        Relationships: []
      }
      lecciones: {
        Row: {
          descripcion: string | null
          duracion: number
          estado_inicial: Database["public"]["Enums"]["estado_leccion"]
          fecha_actualizacion: string
          fecha_creacion: string
          id: string
          modulo_id: string
          orden: number
          titulo: string
          url_audio: string
        }
        Insert: {
          descripcion?: string | null
          duracion: number
          estado_inicial?: Database["public"]["Enums"]["estado_leccion"]
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          modulo_id: string
          orden: number
          titulo: string
          url_audio: string
        }
        Update: {
          descripcion?: string | null
          duracion?: number
          estado_inicial?: Database["public"]["Enums"]["estado_leccion"]
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          modulo_id?: string
          orden?: number
          titulo?: string
          url_audio?: string
        }
        Relationships: []
      }
      mercadopago_transactions: {
        Row: {
          amount: number
          course_id: string
          created_at: string
          currency: string
          id: string
          payment_id: string | null
          preference_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          course_id: string
          created_at?: string
          currency?: string
          id?: string
          payment_id?: string | null
          preference_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          course_id?: string
          created_at?: string
          currency?: string
          id?: string
          payment_id?: string | null
          preference_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      modulos: {
        Row: {
          curso_id: string
          descripcion: string | null
          fecha_actualizacion: string
          fecha_creacion: string
          id: string
          orden: number
          titulo: string
        }
        Insert: {
          curso_id: string
          descripcion?: string | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          orden: number
          titulo: string
        }
        Update: {
          curso_id?: string
          descripcion?: string | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          orden?: number
          titulo?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          email_verified: boolean | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          is_saved: boolean | null
          last_listened_at: string | null
          progress_percentage: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          is_saved?: boolean | null
          last_listened_at?: string | null
          progress_percentage?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          is_saved?: boolean | null
          last_listened_at?: string | null
          progress_percentage?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          course_id: string | null
          created_at: string | null
          current_position: number | null
          id: string
          is_completed: boolean | null
          lesson_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          current_position?: number | null
          id?: string
          is_completed?: boolean | null
          lesson_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          current_position?: number | null
          id?: string
          is_completed?: boolean | null
          lesson_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_creator_social_media: {
        Args: {
          creator_id: string
        }
        Returns: {
          platform: string
          url: string
        }[]
      }
    }
    Enums: {
      estado_leccion: "activo" | "bloqueado" | "completado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"])
    ? (PublicSchema["Tables"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"])
    ? (PublicSchema["Tables"])[PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"])
    ? (PublicSchema["Tables"])[PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof (PublicSchema["Enums"])
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicEnumNameOrOptions["schema"]]["Enums"])
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof (PublicSchema["Enums"])
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
