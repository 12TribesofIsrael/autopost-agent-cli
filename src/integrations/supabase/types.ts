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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          brand_voice: string | null
          business_name: string | null
          created_at: string | null
          id: string
          industry: Database["public"]["Enums"]["industry"] | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          posting_goals: string[] | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
          website_url: string | null
        }
        Insert: {
          brand_voice?: string | null
          business_name?: string | null
          created_at?: string | null
          id: string
          industry?: Database["public"]["Enums"]["industry"] | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          posting_goals?: string[] | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          website_url?: string | null
        }
        Update: {
          brand_voice?: string | null
          business_name?: string | null
          created_at?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry"] | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          posting_goals?: string[] | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          website_url?: string | null
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          access_token: string | null
          connected: boolean | null
          connected_at: string | null
          created_at: string | null
          handle: string | null
          id: string
          platform: string
          refresh_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected?: boolean | null
          connected_at?: string | null
          created_at?: string | null
          handle?: string | null
          id?: string
          platform: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected?: boolean | null
          connected_at?: string | null
          created_at?: string | null
          handle?: string | null
          id?: string
          platform?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          auto_publish: boolean | null
          created_at: string | null
          id: string
          posting_frequency:
            | Database["public"]["Enums"]["posting_frequency"]
            | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_publish?: boolean | null
          created_at?: string | null
          id?: string
          posting_frequency?:
            | Database["public"]["Enums"]["posting_frequency"]
            | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_publish?: boolean | null
          created_at?: string | null
          id?: string
          posting_frequency?:
            | Database["public"]["Enums"]["posting_frequency"]
            | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_requests: {
        Row: {
          created_at: string
          drive_file_ids: string[] | null
          drive_upload_status: string
          email: string
          file_name: string | null
          frequency: string
          id: string
          name: string
          notes: string | null
          platforms: string[]
          submitted_at: string
          updated_at: string
          user_id: string
          video_link: string
        }
        Insert: {
          created_at?: string
          drive_file_ids?: string[] | null
          drive_upload_status?: string
          email: string
          file_name?: string | null
          frequency: string
          id?: string
          name: string
          notes?: string | null
          platforms: string[]
          submitted_at?: string
          updated_at?: string
          user_id: string
          video_link: string
        }
        Update: {
          created_at?: string
          drive_file_ids?: string[] | null
          drive_upload_status?: string
          email?: string
          file_name?: string | null
          frequency?: string
          id?: string
          name?: string
          notes?: string | null
          platforms?: string[]
          submitted_at?: string
          updated_at?: string
          user_id?: string
          video_link?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          created_at: string | null
          destination_platform: string
          enabled: boolean | null
          id: string
          source_platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          destination_platform: string
          enabled?: boolean | null
          id?: string
          source_platform: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          destination_platform?: string
          enabled?: boolean | null
          id?: string
          source_platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      industry:
        | "boxing_combat_sports"
        | "fitness_gym"
        | "food_restaurant"
        | "retail_storefront"
        | "beauty_salon"
        | "other_local_business"
      posting_frequency: "few_times_week" | "daily" | "multiple_per_day"
      user_type:
        | "boxer_fighter"
        | "gym_studio"
        | "restaurant_food"
        | "other_local_business"
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
      industry: [
        "boxing_combat_sports",
        "fitness_gym",
        "food_restaurant",
        "retail_storefront",
        "beauty_salon",
        "other_local_business",
      ],
      posting_frequency: ["few_times_week", "daily", "multiple_per_day"],
      user_type: [
        "boxer_fighter",
        "gym_studio",
        "restaurant_food",
        "other_local_business",
      ],
    },
  },
} as const
