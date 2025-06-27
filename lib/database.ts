import { supabase } from './supabase'
import type { Tables, Inserts, Updates } from './supabase'

// Check if we're using placeholder credentials
const isPlaceholderMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return url.includes('placeholder') || key.includes('placeholder')
}

export class DatabaseService {
  // User operations
  static async createUser(userData: Inserts<'users'>) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) throw new Error(`Failed to create user: ${error.message}`)
    return data
  }

  static async getUserByWallet(walletAddress: string) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user: ${error.message}`)
    }
    return data
  }

  static async updateUser(userId: string, updates: Updates<'users'>) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update user: ${error.message}`)
    return data
  }

  // Artist profile operations
  static async createArtistProfile(profileData: Inserts<'artist_profiles'>) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('artist_profiles')
      .insert(profileData)
      .select(`
        *,
        users (
          wallet_address,
          ens_name,
          display_name_option,
          username,
          user_level
        )
      `)
      .single()

    if (error) throw new Error(`Failed to create artist profile: ${error.message}`)
    return data
  }

  static async getArtistProfile(artistId: string) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('artist_profiles')
      .select(`
        *,
        users (
          wallet_address,
          ens_name,
          display_name_option,
          username,
          user_level
        )
      `)
      .eq('id', artistId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get artist profile: ${error.message}`)
    }
    return data
  }

  static async getArtistByUserId(userId: string) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('artist_profiles')
      .select(`
        *,
        users (
          wallet_address,
          ens_name,
          display_name_option,
          username,
          user_level
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get artist by user ID: ${error.message}`)
    }
    return data
  }

  static async getAllArtists(filters?: {
    verified?: boolean
    featured?: boolean
    badgeTier?: string
    limit?: number
    offset?: number
  }) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    let query = supabase
      .from('artist_profiles')
      .select(`
        *,
        users (
          wallet_address,
          ens_name,
          display_name_option,
          username,
          user_level
        )
      `)

    if (filters?.verified !== undefined) {
      query = query.eq('is_verified', filters.verified)
    }
    if (filters?.featured !== undefined) {
      query = query.eq('is_featured', filters.featured)
    }
    if (filters?.badgeTier) {
      query = query.eq('badge_tier', filters.badgeTier)
    }

    query = query.order('created_at', { ascending: false })

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to get artists: ${error.message}`)
    return data || []
  }

  static async updateArtistProfile(artistId: string, updates: Updates<'artist_profiles'>) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('artist_profiles')
      .update(updates)
      .eq('id', artistId)
      .select(`
        *,
        users (
          wallet_address,
          ens_name,
          display_name_option,
          username,
          user_level
        )
      `)
      .single()

    if (error) throw new Error(`Failed to update artist profile: ${error.message}`)
    return data
  }

  // Artwork submission operations
  static async createArtworkSubmission(submissionData: Inserts<'artwork_submissions'>) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('artwork_submissions')
      .insert(submissionData)
      .select(`
        *,
        artist_profiles (
          name,
          profile_image,
          badge_tier,
          users (
            wallet_address,
            ens_name,
            display_name_option,
            username
          )
        )
      `)
      .single()

    if (error) throw new Error(`Failed to create artwork submission: ${error.message}`)
    return data
  }

  static async getArtworkSubmission(submissionId: string) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('artwork_submissions')
      .select(`
        *,
        artist_profiles (
          name,
          profile_image,
          badge_tier,
          users (
            wallet_address,
            ens_name,
            display_name_option,
            username
          )
        )
      `)
      .eq('id', submissionId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get artwork submission: ${error.message}`)
    }
    return data
  }

  static async getArtworkSubmissions(filters?: {
    artistId?: string
    status?: string
    schedulingType?: string
    limit?: number
    offset?: number
  }) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    let query = supabase
      .from('artwork_submissions')
      .select(`
        *,
        artist_profiles (
          name,
          profile_image,
          badge_tier,
          users (
            wallet_address,
            ens_name,
            display_name_option,
            username
          )
        )
      `)

    if (filters?.artistId) {
      query = query.eq('artist_id', filters.artistId)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.schedulingType) {
      query = query.eq('scheduling_type', filters.schedulingType)
    }

    query = query.order('created_at', { ascending: false })

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to get artwork submissions: ${error.message}`)
    return data || []
  }

  static async updateArtworkSubmission(submissionId: string, updates: Updates<'artwork_submissions'>) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('artwork_submissions')
      .update(updates)
      .eq('id', submissionId)
      .select(`
        *,
        artist_profiles (
          name,
          profile_image,
          badge_tier,
          users (
            wallet_address,
            ens_name,
            display_name_option,
            username
          )
        )
      `)
      .single()

    if (error) throw new Error(`Failed to update artwork submission: ${error.message}`)
    return data
  }

  // Bidding operations
  static async createBid(bidData: Inserts<'bids'>) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('bids')
      .insert(bidData)
      .select(`
        *,
        users (
          wallet_address,
          ens_name,
          display_name_option,
          username,
          user_level
        ),
        artwork_submissions (
          title,
          artist_profiles (
            name
          )
        )
      `)
      .single()

    if (error) throw new Error(`Failed to create bid: ${error.message}`)
    return data
  }

  static async getBidsForArtwork(artworkId: string) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('bids')
      .select(`
        *,
        users (
          wallet_address,
          ens_name,
          display_name_option,
          username,
          user_level
        )
      `)
      .eq('artwork_id', artworkId)
      .order('amount', { ascending: false })

    if (error) throw new Error(`Failed to get bids: ${error.message}`)
    return data || []
  }

  static async getUserBids(userId: string) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('bids')
      .select(`
        *,
        artwork_submissions (
          title,
          image_url,
          artist_profiles (
            name
          )
        )
      `)
      .eq('bidder_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get user bids: ${error.message}`)
    return data || []
  }

  static async updateBid(bidId: string, updates: Updates<'bids'>) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('bids')
      .update(updates)
      .eq('id', bidId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update bid: ${error.message}`)
    return data
  }

  // Chat operations
  static async createChatMessage(messageData: Inserts<'chat_messages'>) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select(`
        *,
        users (
          wallet_address,
          ens_name,
          display_name_option,
          username,
          user_level
        )
      `)
      .single()

    if (error) throw new Error(`Failed to create chat message: ${error.message}`)
    return data
  }

  static async getChatMessages(limit = 50, offset = 0) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        users (
          wallet_address,
          ens_name,
          display_name_option,
          username,
          user_level
        )
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw new Error(`Failed to get chat messages: ${error.message}`)
    return data || []
  }

  static async updateChatMessage(messageId: string, updates: Updates<'chat_messages'>) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .update(updates)
      .eq('id', messageId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update chat message: ${error.message}`)
    return data
  }

  // Search operations
  static async searchArtists(searchTerm: string, limit = 10) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('artist_profiles')
      .select(`
        *,
        users (
          wallet_address,
          ens_name,
          display_name_option,
          username,
          user_level
        )
      `)
      .or(`name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
      .limit(limit)

    if (error) throw new Error(`Failed to search artists: ${error.message}`)
    return data || []
  }

  static async searchArtworks(searchTerm: string, limit = 10) {
    if (isPlaceholderMode()) {
      console.warn('Database operation skipped: using placeholder credentials')
      return null
    }

    const { data, error } = await supabase
      .from('artwork_submissions')
      .select(`
        *,
        artist_profiles (
          name,
          profile_image,
          badge_tier
        )
      `)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .eq('status', 'active')
      .limit(limit)

    if (error) throw new Error(`Failed to search artworks: ${error.message}`)
    return data || []
  }

  // Analytics operations
  static async getLeaderboard(type: 'bids' | 'sales' = 'bids', limit = 10) {
    if (type === 'bids') {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          artist_profiles (
            name,
            profile_image,
            badge_tier
          )
        `)
        .order('bid_count', { ascending: false })
        .limit(limit)

      if (error) throw new Error(`Failed to get bid leaderboard: ${error.message}`)
      return data || []
    } else {
      const { data, error } = await supabase
        .from('artist_profiles')
        .select(`
          *,
          users (
            wallet_address,
            ens_name,
            display_name_option,
            username
          )
        `)
        .order('total_sales', { ascending: false })
        .limit(limit)

      if (error) throw new Error(`Failed to get sales leaderboard: ${error.message}`)
      return data || []
    }
  }

  // Calendar operations
  static async createCalendarEvent(eventData: {
    title: string
    description?: string
    event_type: string
    start_datetime: string
    end_datetime: string
    all_day?: boolean
    artwork_id?: string
    created_by: string
    color?: string
    location?: string
    is_public?: boolean
  }) {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single()

    if (error) throw new Error(`Failed to create calendar event: ${error.message}`)
    return data
  }

  static async getCalendarEvents(filters?: {
    start?: string
    end?: string
    event_type?: string
    is_public?: boolean
  }) {
    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        artwork_submissions (
          title,
          artist_profiles (
            name
          )
        ),
        users (
          wallet_address,
          ens_name,
          display_name_option,
          username
        )
      `)

    if (filters?.start) {
      query = query.gte('start_datetime', filters.start)
    }
    if (filters?.end) {
      query = query.lte('end_datetime', filters.end)
    }
    if (filters?.event_type) {
      query = query.eq('event_type', filters.event_type)
    }
    if (filters?.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public)
    }

    query = query.order('start_datetime', { ascending: true })

    const { data, error } = await query

    if (error) throw new Error(`Failed to get calendar events: ${error.message}`)
    return data || []
  }

  static async updateCalendarEvent(eventId: string, updates: {
    title?: string
    description?: string
    start_datetime?: string
    end_datetime?: string
    color?: string
    is_cancelled?: boolean
  }) {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update calendar event: ${error.message}`)
    return data
  }

  static async deleteCalendarEvent(eventId: string) {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)

    if (error) throw new Error(`Failed to delete calendar event: ${error.message}`)
  }

  // Chat export operations (admin only)
  static async createChatExport(exportData: {
    requested_by: string
    export_type: string
    date_range_start?: string
    date_range_end?: string
    user_filter?: string
    flagged_only?: boolean
    deleted_included?: boolean
    export_format?: string
  }) {
    const { data, error } = await supabase
      .from('chat_exports')
      .insert({
        ...exportData,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create chat export: ${error.message}`)
    return data
  }

  static async getChatExports(adminUserId: string) {
    const { data, error } = await supabase
      .from('chat_exports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get chat exports: ${error.message}`)
    return data || []
  }

  static async updateChatExport(exportId: string, updates: {
    status?: string
    file_url?: string
    file_size_bytes?: number
    total_messages?: number
    processing_started_at?: string
    processing_completed_at?: string
  }) {
    const { data, error } = await supabase
      .from('chat_exports')
      .update(updates)
      .eq('id', exportId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update chat export: ${error.message}`)
    return data
  }

  static async incrementExportDownload(exportId: string) {
    const { data, error } = await supabase
      .rpc('increment_download_count', { export_id: exportId })

    if (error) throw new Error(`Failed to increment download count: ${error.message}`)
    return data
  }

  // Export chat messages based on filters
  static async exportChatMessages(filters: {
    date_range_start?: string
    date_range_end?: string
    user_filter?: string
    flagged_only?: boolean
    deleted_included?: boolean
  }) {
    let query = supabase
      .from('chat_messages')
      .select(`
        *,
        users (
          wallet_address,
          ens_name,
          display_name_option,
          username,
          user_level
        )
      `)

    if (filters.date_range_start) {
      query = query.gte('created_at', filters.date_range_start)
    }
    if (filters.date_range_end) {
      query = query.lte('created_at', filters.date_range_end)
    }
    if (filters.user_filter) {
      query = query.eq('user_id', filters.user_filter)
    }
    if (filters.flagged_only) {
      query = query.eq('is_flagged', true)
    }
    if (!filters.deleted_included) {
      query = query.eq('is_deleted', false)
    }

    query = query.order('created_at', { ascending: true })

    const { data, error } = await query

    if (error) throw new Error(`Failed to export chat messages: ${error.message}`)
    return data || []
  }
}
