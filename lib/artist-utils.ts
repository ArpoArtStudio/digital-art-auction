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

export interface ArtistBadge {
  type: "blue" | "red" | "gold" | "platinum"
  label: string
  description: string
  icon: string
  glowEffect?: boolean
}

/**
 * Get artist badge based on submission count
 */
export function getArtistBadge(submissionCount: number): ArtistBadge | null {
  if (submissionCount >= 30) {
    return {
      type: "platinum",
      label: "Platinum Artist",
      description: "30+ submissions",
      icon: "✦",
      glowEffect: true
    }
  } else if (submissionCount >= 20) {
    return {
      type: "gold",
      label: "Gold Artist", 
      description: "20+ submissions",
      icon: "★",
      glowEffect: false
    }
  } else if (submissionCount >= 10) {
    return {
      type: "red",
      label: "Veteran Artist",
      description: "10+ submissions", 
      icon: "♦",
      glowEffect: false
    }
  } else if (submissionCount >= 5) {
    return {
      type: "blue",
      label: "Rising Artist",
      description: "5+ submissions",
      icon: "✓",
      glowEffect: false
    }
  }
  return null
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

/**
 * Update artist profile
 */
export function updateArtistProfile(walletAddress: string, updatedData: Partial<ArtistProfile>): boolean {
  try {
    const registeredArtists = JSON.parse(localStorage.getItem('registeredArtists') || '[]')
    const artistIndex = registeredArtists.findIndex((artist: ArtistProfile) => artist.walletAddress === walletAddress)
    
    if (artistIndex === -1) {
      return false
    }
    
    // Update the artist data
    registeredArtists[artistIndex] = { ...registeredArtists[artistIndex], ...updatedData }
    localStorage.setItem('registeredArtists', JSON.stringify(registeredArtists))
    
    return true
  } catch (error) {
    console.error("Error updating artist profile:", error)
    return false
  }
}
