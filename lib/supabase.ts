import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
  throw new Error('Live Supabase credentials are required. Please set up your Supabase project and update environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'digital-art-auction'
    }
  }
})

// Database schema types for type safety
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string | null
          ens_name: string | null
          display_name_option: 'wallet' | 'ens' | 'username'
          username: string | null
          email: string | null
          user_level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6'
          bid_count: number
          total_bid_amount: number
          is_active: boolean
          is_banned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address?: string | null
          ens_name?: string | null
          display_name_option?: 'wallet' | 'ens' | 'username'
          username?: string | null
          email?: string | null
          user_level?: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6'
          bid_count?: number
          total_bid_amount?: number
          is_active?: boolean
          is_banned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string | null
          ens_name?: string | null
          display_name_option?: 'wallet' | 'ens' | 'username'
          username?: string | null
          email?: string | null
          user_level?: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6'
          bid_count?: number
          total_bid_amount?: number
          is_active?: boolean
          is_banned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      artist_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          bio: string | null
          profile_image: string | null
          background_image: string | null
          website: string | null
          twitter: string | null
          instagram: string | null
          discord: string | null
          linkedin: string | null
          tiktok: string | null
          youtube: string | null
          spotify: string | null
          is_verified: boolean
          badge_tier: 'Blue' | 'Red' | 'Gold' | 'Platinum' | null
          submission_count: number
          total_sales: number
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          bio?: string | null
          profile_image?: string | null
          background_image?: string | null
          website?: string | null
          twitter?: string | null
          instagram?: string | null
          discord?: string | null
          linkedin?: string | null
          tiktok?: string | null
          youtube?: string | null
          spotify?: string | null
          is_verified?: boolean
          badge_tier?: 'Blue' | 'Red' | 'Gold' | 'Platinum' | null
          submission_count?: number
          total_sales?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          bio?: string | null
          profile_image?: string | null
          background_image?: string | null
          website?: string | null
          twitter?: string | null
          instagram?: string | null
          discord?: string | null
          linkedin?: string | null
          tiktok?: string | null
          youtube?: string | null
          spotify?: string | null
          is_verified?: boolean
          badge_tier?: 'Blue' | 'Red' | 'Gold' | 'Platinum' | null
          submission_count?: number
          total_sales?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      artwork_submissions: {
        Row: {
          id: string
          artist_id: string
          title: string
          description: string | null
          image_url: string | null
          ipfs_hash: string | null
          metadata_ipfs_hash: string | null
          starting_bid: number
          buy_now_price: number | null
          status: 'pending' | 'approved' | 'rejected' | 'active' | 'sold' | 'ended'
          scheduling_type: 'immediate' | 'scheduled' | 'queue'
          scheduled_start: string | null
          scheduled_end: string | null
          queue_position: number | null
          admin_notes: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          title: string
          description?: string | null
          image_url?: string | null
          ipfs_hash?: string | null
          metadata_ipfs_hash?: string | null
          starting_bid: number
          buy_now_price?: number | null
          status?: 'pending' | 'approved' | 'rejected' | 'active' | 'sold' | 'ended'
          scheduling_type?: 'immediate' | 'scheduled' | 'queue'
          scheduled_start?: string | null
          scheduled_end?: string | null
          queue_position?: number | null
          admin_notes?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          ipfs_hash?: string | null
          metadata_ipfs_hash?: string | null
          starting_bid?: number
          buy_now_price?: number | null
          status?: 'pending' | 'approved' | 'rejected' | 'active' | 'sold' | 'ended'
          scheduling_type?: 'immediate' | 'scheduled' | 'queue'
          scheduled_start?: string | null
          scheduled_end?: string | null
          queue_position?: number | null
          admin_notes?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bids: {
        Row: {
          id: string
          artwork_id: string
          bidder_id: string
          amount: number
          status: 'active' | 'outbid' | 'winning' | 'won' | 'cancelled'
          escrow_hash: string | null
          payment_status: 'pending' | 'escrowed' | 'paid' | 'refunded' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artwork_id: string
          bidder_id: string
          amount: number
          status?: 'active' | 'outbid' | 'winning' | 'won' | 'cancelled'
          escrow_hash?: string | null
          payment_status?: 'pending' | 'escrowed' | 'paid' | 'refunded' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artwork_id?: string
          bidder_id?: string
          amount?: number
          status?: 'active' | 'outbid' | 'winning' | 'won' | 'cancelled'
          escrow_hash?: string | null
          payment_status?: 'pending' | 'escrowed' | 'paid' | 'refunded' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          message: string
          is_deleted: boolean
          is_flagged: boolean
          moderated_by: string | null
          moderation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          is_deleted?: boolean
          is_flagged?: boolean
          moderated_by?: string | null
          moderation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          is_deleted?: boolean
          is_flagged?: boolean
          moderated_by?: string | null
          moderation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type { PostgrestError } from '@supabase/supabase-js'
