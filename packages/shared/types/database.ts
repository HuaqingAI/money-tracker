/**
 * Database row types (DO — Data Object layer).
 *
 * Authoritative source: generate via Supabase CLI against a running local
 * stack:
 *
 *   npx supabase gen types typescript --local --schema auth,billing,analytics \
 *     > packages/shared/types/database.ts
 *
 * The definitions below are a hand-written baseline matching the migrations
 * in supabase/migrations/. Replace with CLI output once the local stack is
 * running. Field names intentionally use snake_case to match PostgreSQL
 * (DO layer). Mappers in apps/api/lib/mappers/ convert to camelCase VOs.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TransactionStatus = 'pending_confirmation' | 'confirmed' | 'rejected';
export type SubscriptionProvider = 'wechat' | 'alipay' | 'apple_iap';
export type CategoryRuleSource = 'ai' | 'user';

export interface Database {
  auth: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          wechat_unionid: Uint8Array | null;
          wechat_openid: Uint8Array | null;
          phone_number: Uint8Array | null;
          nickname: string | null;
          avatar_url: string | null;
          consent_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wechat_unionid?: Uint8Array | null;
          wechat_openid?: Uint8Array | null;
          phone_number?: Uint8Array | null;
          nickname?: string | null;
          avatar_url?: string | null;
          consent_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['auth']['Tables']['user_profiles']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          provider: SubscriptionProvider;
          plan: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: SubscriptionProvider;
          plan: string;
          expires_at: string;
          created_at?: string;
        };
        Update: Partial<Database['auth']['Tables']['subscriptions']['Insert']>;
      };
    };
  };
  billing: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          sort_order: number;
          is_system: boolean;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string | null;
          sort_order?: number;
          is_system?: boolean;
          user_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['billing']['Tables']['categories']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount_cents: number;
          status: TransactionStatus;
          category_id: string | null;
          source: string | null;
          merchant: string | null;
          description: string | null;
          transaction_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount_cents: number;
          status: TransactionStatus;
          category_id?: string | null;
          source?: string | null;
          merchant?: string | null;
          description?: string | null;
          transaction_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['billing']['Tables']['transactions']['Insert']>;
      };
      category_rules: {
        Row: {
          id: string;
          keyword: string;
          category_id: string;
          user_id: string;
          hit_count: number;
          source: CategoryRuleSource;
          created_at: string;
        };
        Insert: {
          id?: string;
          keyword: string;
          category_id: string;
          user_id: string;
          hit_count?: number;
          source: CategoryRuleSource;
          created_at?: string;
        };
        Update: Partial<Database['billing']['Tables']['category_rules']['Insert']>;
      };
      csv_parse_rules: {
        Row: {
          id: string;
          platform: string;
          version: string;
          rule_config: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          platform: string;
          version: string;
          rule_config: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['billing']['Tables']['csv_parse_rules']['Insert']>;
      };
    };
  };
  analytics: {
    Tables: {
      monthly_summaries: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          total_cents: number;
          category_breakdown: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          total_cents?: number;
          category_breakdown?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['analytics']['Tables']['monthly_summaries']['Insert']>;
      };
    };
  };
}

export type Tables<
  S extends keyof Database,
  T extends keyof Database[S]['Tables'],
> = Database[S]['Tables'][T] extends { Row: infer R } ? R : never;
