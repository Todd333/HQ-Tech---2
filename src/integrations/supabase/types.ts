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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      banned_ips: {
        Row: {
          banned_at: string | null
          banned_by: string | null
          expires_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          reason: string
        }
        Insert: {
          banned_at?: string | null
          banned_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address: unknown
          is_active?: boolean | null
          reason: string
        }
        Update: {
          banned_at?: string | null
          banned_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          reason?: string
        }
        Relationships: []
      }
      board_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company: string
          contact_role: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          ip_address: unknown | null
          job_title: string | null
          last_name: string
          message: string
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          company: string
          contact_role?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          ip_address?: unknown | null
          job_title?: string | null
          last_name: string
          message: string
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          company?: string
          contact_role?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          ip_address?: unknown | null
          job_title?: string | null
          last_name?: string
          message?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      post_reports: {
        Row: {
          admin_note: string | null
          created_at: string | null
          id: string
          is_processed: boolean | null
          post_id: string | null
          processed_at: string | null
          processed_by: string | null
          report_detail: string | null
          report_reason: string
          reporter_ip: unknown | null
          reporter_user_agent: string | null
        }
        Insert: {
          admin_note?: string | null
          created_at?: string | null
          id?: string
          is_processed?: boolean | null
          post_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          report_detail?: string | null
          report_reason: string
          reporter_ip?: unknown | null
          reporter_user_agent?: string | null
        }
        Update: {
          admin_note?: string | null
          created_at?: string | null
          id?: string
          is_processed?: boolean | null
          post_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          report_detail?: string | null
          report_reason?: string
          reporter_ip?: unknown | null
          reporter_user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_stats: {
        Row: {
          last_reply_at: string | null
          like_count: number | null
          post_id: string
          reply_count: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          last_reply_at?: string | null
          like_count?: number | null
          post_id: string
          reply_count?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          last_reply_at?: string | null
          like_count?: number | null
          post_id?: string
          reply_count?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_stats_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_name: string
          author_password_hash: string | null
          content: string
          created_at: string | null
          depth: number | null
          id: string
          ip_address: unknown | null
          is_deleted: boolean | null
          parent_id: string | null
          security_key_id: string | null
          sort_order: number | null
          title: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          author_name: string
          author_password_hash?: string | null
          content: string
          created_at?: string | null
          depth?: number | null
          id?: string
          ip_address?: unknown | null
          is_deleted?: boolean | null
          parent_id?: string | null
          security_key_id?: string | null
          sort_order?: number | null
          title?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          author_name?: string
          author_password_hash?: string | null
          content?: string
          created_at?: string | null
          depth?: number | null
          id?: string
          ip_address?: unknown | null
          is_deleted?: boolean | null
          parent_id?: string | null
          security_key_id?: string | null
          sort_order?: number | null
          title?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_security_key_id_fkey"
            columns: ["security_key_id"]
            isOneToOne: false
            referencedRelation: "security_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_key_requests: {
        Row: {
          assigned_security_key: string | null
          auto_generated_password: string | null
          created_at: string
          email: string
          id: string
          ip_address: unknown | null
          message: string | null
          processed_at: string | null
          request_status: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          assigned_security_key?: string | null
          auto_generated_password?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown | null
          message?: string | null
          processed_at?: string | null
          request_status?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          assigned_security_key?: string | null
          auto_generated_password?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown | null
          message?: string | null
          processed_at?: string | null
          request_status?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      security_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_post: {
        Args: {
          p_author_name?: string
          p_author_password?: string
          p_content?: string
          p_ip_address?: unknown
          p_parent_id?: string
          p_security_key?: string
          p_title?: string
          p_user_agent?: string
        }
        Returns: string
      }
      create_security_key_request: {
        Args: {
          p_email: string
          p_ip_address?: unknown
          p_message?: string
          p_user_agent?: string
        }
        Returns: string
      }
      delete_post: {
        Args: { p_author_password: string; p_post_id: string }
        Returns: boolean
      }
      delete_post_admin: {
        Args: {
          p_admin_user_id?: string
          p_author_password?: string
          p_post_id: string
        }
        Returns: boolean
      }
      generate_random_password: {
        Args: { length?: number }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_post_with_sensitive_data: {
        Args: { post_id_param: string }
        Returns: {
          author_name: string
          author_password_hash: string
          content: string
          created_at: string
          depth: number
          id: string
          ip_address: unknown
          is_deleted: boolean
          parent_id: string
          security_key_id: string
          sort_order: number
          title: string
          updated_at: string
          user_agent: string
          user_id: string
        }[]
      }
      get_thread_posts: {
        Args: { p_limit?: number; p_offset?: number; p_parent_id?: string }
        Returns: {
          author_name: string
          content: string
          created_at: string
          depth: number
          id: string
          last_reply_at: string
          like_count: number
          parent_id: string
          reply_count: number
          sort_order: number
          title: string
          updated_at: string
          view_count: number
        }[]
      }
      get_thread_posts_safe: {
        Args: { p_limit?: number; p_offset?: number; p_parent_id?: string }
        Returns: {
          author_name: string
          content: string
          created_at: string
          depth: number
          id: string
          last_reply_at: string
          like_count: number
          parent_id: string
          reply_count: number
          sort_order: number
          title: string
          updated_at: string
          view_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_view_count: {
        Args: { post_id_param: string }
        Returns: undefined
      }
      is_ip_banned: {
        Args: { ip_input: unknown }
        Returns: boolean
      }
      verify_security_key: {
        Args: { key_input: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "Admin" | "User"
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
      app_role: ["Admin", "User"],
    },
  },
} as const
