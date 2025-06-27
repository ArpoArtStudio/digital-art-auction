import { DatabaseService } from './database'
import { v4 as uuidv4 } from 'uuid'

interface LocalStorageArtist {
  id: string
  name: string
  bio?: string
  profileImage?: string
  backgroundImage?: string
  website?: string
  twitter?: string
  instagram?: string
  discord?: string
  linkedin?: string
  tiktok?: string
  youtube?: string
  spotify?: string
  isVerified?: boolean
  submissionCount?: number
  createdAt?: string
  walletAddress?: string
}

interface LocalStorageArtwork {
  id: string
  artistId: string
  title: string
  description?: string
  imageUrl?: string
  startingBid: number
  buyNowPrice?: number
  status?: string
  schedulingType?: string
  scheduledStart?: string
  scheduledEnd?: string
  createdAt?: string
}

interface LocalStorageBid {
  id: string
  artworkId: string
  bidderAddress: string
  amount: number
  timestamp: number
  status?: string
}

interface LocalStorageUser {
  address: string
  ensName?: string
  username?: string
  userLevel?: string
  bidCount?: number
  totalBidAmount?: number
}

export class MigrationService {
  /**
   * Migrate all localStorage data to Supabase
   */
  static async migrateAllData(): Promise<{
    users: number
    artists: number
    artworks: number
    bids: number
    errors: string[]
  }> {
    const results = {
      users: 0,
      artists: 0,
      artworks: 0,
      bids: 0,
      errors: [] as string[]
    }

    try {
      // Migrate users first
      const usersResult = await this.migrateUsers()
      results.users = usersResult.migrated
      results.errors.push(...usersResult.errors)

      // Migrate artists
      const artistsResult = await this.migrateArtists()
      results.artists = artistsResult.migrated
      results.errors.push(...artistsResult.errors)

      // Migrate artworks
      const artworksResult = await this.migrateArtworks()
      results.artworks = artworksResult.migrated
      results.errors.push(...artworksResult.errors)

      // Migrate bids
      const bidsResult = await this.migrateBids()
      results.bids = bidsResult.migrated
      results.errors.push(...bidsResult.errors)

      console.log('Migration completed:', results)
      return results
    } catch (error) {
      console.error('Migration failed:', error)
      results.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return results
    }
  }

  /**
   * Migrate users from localStorage to Supabase
   */
  static async migrateUsers(): Promise<{ migrated: number; errors: string[] }> {
    const result = { migrated: 0, errors: [] as string[] }

    try {
      // Get users from localStorage or other sources
      const localUsers = this.getLocalStorageUsers()
      
      for (const localUser of localUsers) {
        try {
          // Check if user already exists
          const existingUser = await DatabaseService.getUserByWallet(localUser.address)
          
          if (!existingUser) {
            await DatabaseService.createUser({
              id: uuidv4(),
              wallet_address: localUser.address,
              ens_name: localUser.ensName || null,
              display_name_option: localUser.ensName ? 'ens' : 'wallet',
              username: localUser.username || null,
              user_level: (localUser.userLevel as any) || 'L1',
              bid_count: localUser.bidCount || 0,
              total_bid_amount: localUser.totalBidAmount || 0,
              is_active: true,
              is_banned: false
            })
            result.migrated++
          }
        } catch (error) {
          result.errors.push(`Failed to migrate user ${localUser.address}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    } catch (error) {
      result.errors.push(`Users migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Migrate artists from localStorage to Supabase
   */
  static async migrateArtists(): Promise<{ migrated: number; errors: string[] }> {
    const result = { migrated: 0, errors: [] as string[] }

    try {
      const localArtists = this.getLocalStorageArtists()
      
      for (const localArtist of localArtists) {
        try {
          // Get or create user for this artist
          let user = null
          if (localArtist.walletAddress) {
            user = await DatabaseService.getUserByWallet(localArtist.walletAddress)
            
            if (!user) {
              user = await DatabaseService.createUser({
                id: uuidv4(),
                wallet_address: localArtist.walletAddress,
                display_name_option: 'wallet',
                user_level: 'L1',
                bid_count: 0,
                total_bid_amount: 0,
                is_active: true,
                is_banned: false
              })
            }
          }

          if (user) {
            // Check if artist profile already exists
            const existingArtist = await DatabaseService.getArtistByUserId(user.id)
            
            if (!existingArtist) {
              await DatabaseService.createArtistProfile({
                id: localArtist.id,
                user_id: user.id,
                name: localArtist.name,
                bio: localArtist.bio || null,
                profile_image: localArtist.profileImage || null,
                background_image: localArtist.backgroundImage || null,
                website: localArtist.website || null,
                twitter: localArtist.twitter || null,
                instagram: localArtist.instagram || null,
                discord: localArtist.discord || null,
                linkedin: localArtist.linkedin || null,
                tiktok: localArtist.tiktok || null,
                youtube: localArtist.youtube || null,
                spotify: localArtist.spotify || null,
                is_verified: localArtist.isVerified || false,
                submission_count: localArtist.submissionCount || 0,
                total_sales: 0,
                is_featured: false
              })
              result.migrated++
            }
          }
        } catch (error) {
          result.errors.push(`Failed to migrate artist ${localArtist.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    } catch (error) {
      result.errors.push(`Artists migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Migrate artworks from localStorage to Supabase
   */
  static async migrateArtworks(): Promise<{ migrated: number; errors: string[] }> {
    const result = { migrated: 0, errors: [] as string[] }

    try {
      const localArtworks = this.getLocalStorageArtworks()
      
      for (const localArtwork of localArtworks) {
        try {
          await DatabaseService.createArtworkSubmission({
            id: localArtwork.id,
            artist_id: localArtwork.artistId,
            title: localArtwork.title,
            description: localArtwork.description || null,
            image_url: localArtwork.imageUrl || null,
            starting_bid: localArtwork.startingBid,
            buy_now_price: localArtwork.buyNowPrice || null,
            status: (localArtwork.status as any) || 'pending',
            scheduling_type: (localArtwork.schedulingType as any) || 'immediate',
            scheduled_start: localArtwork.scheduledStart || null,
            scheduled_end: localArtwork.scheduledEnd || null
          })
          result.migrated++
        } catch (error) {
          result.errors.push(`Failed to migrate artwork ${localArtwork.title}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    } catch (error) {
      result.errors.push(`Artworks migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Migrate bids from localStorage to Supabase
   */
  static async migrateBids(): Promise<{ migrated: number; errors: string[] }> {
    const result = { migrated: 0, errors: [] as string[] }

    try {
      const localBids = this.getLocalStorageBids()
      
      for (const localBid of localBids) {
        try {
          // Get user by wallet address
          const user = await DatabaseService.getUserByWallet(localBid.bidderAddress)
          
          if (user) {
            await DatabaseService.createBid({
              id: localBid.id,
              artwork_id: localBid.artworkId,
              bidder_id: user.id,
              amount: localBid.amount,
              status: (localBid.status as any) || 'active',
              payment_status: 'pending'
            })
            result.migrated++
          }
        } catch (error) {
          result.errors.push(`Failed to migrate bid ${localBid.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    } catch (error) {
      result.errors.push(`Bids migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Get users from localStorage (implement based on your current storage structure)
   */
  private static getLocalStorageUsers(): LocalStorageUser[] {
    try {
      const stored = localStorage.getItem('auction_users')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  /**
   * Get artists from localStorage (implement based on your current storage structure)
   */
  private static getLocalStorageArtists(): LocalStorageArtist[] {
    try {
      const stored = localStorage.getItem('registeredArtists')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  /**
   * Get artworks from localStorage (implement based on your current storage structure)
   */
  private static getLocalStorageArtworks(): LocalStorageArtwork[] {
    try {
      const stored = localStorage.getItem('artwork_submissions')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  /**
   * Get bids from localStorage (implement based on your current storage structure)
   */
  private static getLocalStorageBids(): LocalStorageBid[] {
    try {
      const stored = localStorage.getItem('auction_bids')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  /**
   * Clear localStorage after successful migration
   */
  static clearLocalStorage(): void {
    const keysToRemove = [
      'registeredArtists',
      'artwork_submissions',
      'auction_bids',
      'auction_users',
      'chat_messages',
      'user_preferences'
    ]

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    console.log('LocalStorage cleared after migration')
  }

  /**
   * Backup localStorage data before migration
   */
  static backupLocalStorage(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      data: {} as Record<string, any>
    }

    const keysToBackup = [
      'registeredArtists',
      'artwork_submissions',
      'auction_bids',
      'auction_users',
      'chat_messages',
      'user_preferences'
    ]

    keysToBackup.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        try {
          backup.data[key] = JSON.parse(value)
        } catch {
          backup.data[key] = value
        }
      }
    })

    return JSON.stringify(backup, null, 2)
  }
}
