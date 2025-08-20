export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      action_plan_items: {
        Row: {
          created_at: string | null
          id: string
          is_completed: boolean | null
          summary_id: string | null
          text: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          summary_id?: string | null
          text: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          summary_id?: string | null
          text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plan_items_summary_id_fkey"
            columns: ["summary_id"]
            isOneToOne: false
            referencedRelation: "course_summaries"
            referencedColumns: ["id"]
          },
        ]
      }
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
        Relationships: [
          {
            foreignKeyName: "compras_cursos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      course_summaries: {
        Row: {
          action_plans: Json | null
          course_id: string
          created_at: string
          id: string
          key_concepts: string | null
          personal_insight: string | null
          summary_content: string
          summary_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_plans?: Json | null
          course_id: string
          created_at?: string
          id?: string
          key_concepts?: string | null
          personal_insight?: string | null
          summary_content: string
          summary_type?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_plans?: Json | null
          course_id?: string
          created_at?: string
          id?: string
          key_concepts?: string | null
          personal_insight?: string | null
          summary_content?: string
          summary_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
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
        Relationships: [
          {
            foreignKeyName: "creador_social_media_creador_id_fkey"
            columns: ["creador_id"]
            isOneToOne: false
            referencedRelation: "creadores"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "curso_votos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "cursos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_curso_creador"
            columns: ["creador_id"]
            isOneToOne: false
            referencedRelation: "creadores"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "lecciones_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_notes: {
        Row: {
          course_id: string
          created_at: string
          id: string
          lesson_id: string
          note_text: string
          timestamp_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          lesson_id: string
          note_text: string
          timestamp_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string
          note_text?: string
          timestamp_seconds?: number
          updated_at?: string
          user_id?: string
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
        Relationships: [
          {
            foreignKeyName: "mercadopago_transactions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "modulos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lecciones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_creator_social_media: {
        Args: { creator_id: string }
        Returns: {
          platform: string
          url: string
        }[]
      }
    }
    Enums: {
      estado_leccion: "disponible" | "bloqueado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_leccion: ["disponible", "bloqueado"],
    },
  },
} as const
