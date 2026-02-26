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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      broadcasts: {
        Row: {
          audience_filter: Json | null
          company_id: string
          created_at: string
          id: string
          message: string
          scheduled_at: string | null
          sent_at: string | null
          status: string
          title: string
          total_sent: number | null
        }
        Insert: {
          audience_filter?: Json | null
          company_id: string
          created_at?: string
          id?: string
          message?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          title?: string
          total_sent?: number | null
        }
        Update: {
          audience_filter?: Json | null
          company_id?: string
          created_at?: string
          id?: string
          message?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          title?: string
          total_sent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          ai_instructions: string | null
          business_hours: Json | null
          created_at: string
          escalation_rules: string | null
          id: string
          language: string | null
          logo_url: string | null
          mp_key: string | null
          name: string
          objections: string | null
          openai_key: string | null
          segment: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
          whatsapp_phone_id: string | null
          whatsapp_token: string | null
          whatsapp_verify_token: string | null
        }
        Insert: {
          address?: string | null
          ai_instructions?: string | null
          business_hours?: Json | null
          created_at?: string
          escalation_rules?: string | null
          id?: string
          language?: string | null
          logo_url?: string | null
          mp_key?: string | null
          name?: string
          objections?: string | null
          openai_key?: string | null
          segment?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
          whatsapp_phone_id?: string | null
          whatsapp_token?: string | null
          whatsapp_verify_token?: string | null
        }
        Update: {
          address?: string | null
          ai_instructions?: string | null
          business_hours?: Json | null
          created_at?: string
          escalation_rules?: string | null
          id?: string
          language?: string | null
          logo_url?: string | null
          mp_key?: string | null
          name?: string
          objections?: string | null
          openai_key?: string | null
          segment?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
          whatsapp_phone_id?: string | null
          whatsapp_token?: string | null
          whatsapp_verify_token?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          company_id: string
          created_at: string
          customer_name: string | null
          customer_phone: string
          id: string
          last_message: string | null
          last_message_at: string | null
          status: string
        }
        Insert: {
          company_id: string
          created_at?: string
          customer_name?: string | null
          customer_phone?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          status?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          customer_name?: string | null
          customer_phone?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      flows: {
        Row: {
          active: boolean
          company_id: string
          created_at: string
          executions: number | null
          id: string
          name: string
          steps: Json | null
        }
        Insert: {
          active?: boolean
          company_id: string
          created_at?: string
          executions?: number | null
          id?: string
          name?: string
          steps?: Json | null
        }
        Update: {
          active?: boolean
          company_id?: string
          created_at?: string
          executions?: number | null
          id?: string
          name?: string
          steps?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "flows_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      labels: {
        Row: {
          color: string
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          company_id: string
          created_at?: string
          id?: string
          name?: string
        }
        Update: {
          color?: string
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "labels_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          role?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          company_id: string
          conversation_id: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          link_sent_at: string | null
          paid_at: string | null
          payment_method: string | null
          payment_status: string
          product_id: string | null
        }
        Insert: {
          amount?: number
          company_id: string
          conversation_id?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          link_sent_at?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string
          product_id?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          conversation_id?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          link_sent_at?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          card_link: string | null
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          pix_link: string | null
          price: number | null
        }
        Insert: {
          active?: boolean
          card_link?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          pix_link?: string | null
          price?: number | null
        }
        Update: {
          active?: boolean
          card_link?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          pix_link?: string | null
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_replies: {
        Row: {
          company_id: string
          created_at: string
          id: string
          message: string
          shortcut: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          message?: string
          shortcut?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          message?: string
          shortcut?: string
        }
        Relationships: [
          {
            foreignKeyName: "quick_replies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
    Enums: {},
  },
} as const
