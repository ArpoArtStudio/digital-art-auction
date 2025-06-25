/**
 * Utility functions for managing artist registration and profiles
 */

export interface ArtistProfile {
  id: string
  name: string
  bio: string
  email: string
  location: string
  specialization: string
  experience: string
  website: string
  twitter: string
  instagram: string
  facebook: string
  portfolio: string
  walletAddress: string
  avatarUrl: string
  status: "pending" | "active" | "suspended"
  artworks: number
  totalSales: string
  joinDate: string
  registeredAt: string
}

export interface ArtworkSubmission {
  id: string
  title: string
  description: string
  category: string
  startingPrice: string
  artistWallet: string
  imageUrl?: string
  status: "pending" | "approved" | "rejected" | "live" | "sold"
  submittedAt: string
  queuePosition?: number
}

/**
 * Check if a wallet address has completed artist registration
 */
export function isArtistRegistered(walletAddress: string): boolean {
  try {
    const isRegistered = localStorage.getItem(`artistRegistered_${walletAddress}`)
    return !!isRegistered
  } catch (error) {
    console.error("Error checking artist registration:", error)
    return false
  }
}

/**
 * Get artist profile for a wallet address
 */
export function getArtistProfile(walletAddress: string): ArtistProfile | null {
  try {
    const registeredArtists = JSON.parse(localStorage.getItem('registeredArtists') || '[]')
    return registeredArtists.find((artist: ArtistProfile) => artist.walletAddress === walletAddress) || null
  } catch (error) {
    console.error("Error getting artist profile:", error)
    return null
  }
}

/**
 * Get all artwork submissions for a wallet address
 */
export function getArtistSubmissions(walletAddress: string): ArtworkSubmission[] {
  try {
    const allSubmissions = JSON.parse(localStorage.getItem('artworkSubmissions') || '[]')
    return allSubmissions.filter((submission: ArtworkSubmission) => submission.artistWallet === walletAddress)
  } catch (error) {
    console.error("Error getting artist submissions:", error)
    return []
  }
}

/**
 * Add a new artwork submission
 */
export function addArtworkSubmission(submission: ArtworkSubmission): void {
  try {
    const allSubmissions = JSON.parse(localStorage.getItem('artworkSubmissions') || '[]')
    allSubmissions.push(submission)
    localStorage.setItem('artworkSubmissions', JSON.stringify(allSubmissions))
  } catch (error) {
    console.error("Error adding artwork submission:", error)
  }
}

/**
 * Check if this is a user's first time submitting artwork
 */
export function isFirstTimeSubmission(walletAddress: string): boolean {
  const submissions = getArtistSubmissions(walletAddress)
  return submissions.length === 0
}

/**
 * Get artist stats
 */
export function getArtistStats(walletAddress: string) {
  const submissions = getArtistSubmissions(walletAddress)
  
  return {
    totalSubmissions: submissions.length,
    pendingSubmissions: submissions.filter(s => s.status === "pending").length,
    approvedSubmissions: submissions.filter(s => s.status === "approved").length,
    liveAuctions: submissions.filter(s => s.status === "live").length,
    soldArtworks: submissions.filter(s => s.status === "sold").length,
  }
}

/**
 * Register a new artist
 */
export function registerArtist(artistData: ArtistProfile): void {
  try {
    // Add to registered artists
    const existingArtists = JSON.parse(localStorage.getItem('registeredArtists') || '[]')
    existingArtists.push(artistData)
    localStorage.setItem('registeredArtists', JSON.stringify(existingArtists))
    
    // Mark wallet as registered
    localStorage.setItem(`artistRegistered_${artistData.walletAddress}`, 'true')
  } catch (error) {
    console.error("Error registering artist:", error)
  }
}
