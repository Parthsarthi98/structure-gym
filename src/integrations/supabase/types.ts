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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      attempts: {
        Row: {
          case_id: string
          case_prompt: string | null
          case_title: string
          created_at: string
          difficulty: string
          error_types: string[]
          feedback: Json | null
          framework: string
          hints_used: number
          id: string
          industry: string
          mode: string
          rubric: Json | null
          score: number
          time_limit_seconds: number | null
          time_taken_seconds: number | null
          user_answer: Json | null
          user_id: string
        }
        Insert: {
          case_id: string
          case_prompt?: string | null
          case_title: string
          created_at?: string
          difficulty: string
          error_types?: string[]
          feedback?: Json | null
          framework: string
          hints_used?: number
          id?: string
          industry: string
          mode: string
          rubric?: Json | null
          score?: number
          time_limit_seconds?: number | null
          time_taken_seconds?: number | null
          user_answer?: Json | null
          user_id?: string
        }
        Update: {
          case_id?: string
          case_prompt?: string | null
          case_title?: string
          created_at?: string
          difficulty?: string
          error_types?: string[]
          feedback?: Json | null
          framework?: string
          hints_used?: number
          id?: string
          industry?: string
          mode?: string
          rubric?: Json | null
          score?: number
          time_limit_seconds?: number | null
          time_taken_seconds?: number | null
          user_answer?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      bank_items: {
        Row: {
          data: Json
          difficulty: string | null
          framework: string | null
          id: string
          industry: string
          kind: string
        }
        Insert: {
          data: Json
          difficulty?: string | null
          framework?: string | null
          id: string
          industry: string
          kind: string
        }
        Update: {
          data?: Json
          difficulty?: string | null
          framework?: string | null
          id?: string
          industry?: string
          kind?: string
        }
        Relationships: []
      }
      bank_value_chains: {
        Row: {
          data: Json
          industry: string
        }
        Insert: {
          data: Json
          industry: string
        }
        Update: {
          data?: Json
          industry?: string
        }
        Relationships: []
      }
      generated_cases: {
        Row: {
          answer: Json | null
          created_at: string
          difficulty: string
          framework: string
          id: string
          industry: string
          prompt: string
          region: string
          secondary_frameworks: string[]
          title: string
          user_id: string
        }
        Insert: {
          answer?: Json | null
          created_at?: string
          difficulty: string
          framework: string
          id?: string
          industry: string
          prompt: string
          region?: string
          secondary_frameworks?: string[]
          title: string
          user_id?: string
        }
        Update: {
          answer?: Json | null
          created_at?: string
          difficulty?: string
          framework?: string
          id?: string
          industry?: string
          prompt?: string
          region?: string
          secondary_frameworks?: string[]
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string
          lesson_id: string
          quiz_score: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          lesson_id: string
          quiz_score?: number
          user_id?: string
        }
        Update: {
          completed_at?: string
          lesson_id?: string
          quiz_score?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
