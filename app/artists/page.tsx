"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { ArtistCard } from "@/components/artist-card"
import { MyProfile } from "@/components/my-profile"
import { useWallet } from "@/contexts/wallet-context"
import { isArtistRegistered } from "@/lib/artist-utils"

export default function ArtistsPage() {
  const { isConnected, walletAddress } = useWallet()
  const [showMyProfile, setShowMyProfile] = useState(false)
  const [userIsRegisteredArtist, setUserIsRegisteredArtist] = useState(false)

  useEffect(() => {
    if (isConnected && walletAddress) {
      const isRegistered = isArtistRegistered(walletAddress)
      setUserIsRegisteredArtist(isRegistered)
    } else {
      setUserIsRegisteredArtist(false)
    }
  }, [isConnected, walletAddress])

  // Placeholder artist data with different submission counts to show different badges
  const artists = [
    {
      id: "1",
      name: "Digital Visionary",
      bio: "Creating ethereal digital landscapes that blur the boundaries between reality and imagination.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      artCount: 32, // Platinum badge (30+)
      totalSales: "245.5",
      socialLinks: {
        website: "https://digitalvisionary.art",
        twitter: "https://twitter.com/digitalvisionary",
        instagram: "https://instagram.com/digitalvisionary",
        facebook: "https://facebook.com/digitalvisionary"
      }
    },
    {
      id: "2",
      name: "Pixel Prophet",
      bio: "Exploring the intersection of traditional art techniques and digital innovation.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      artCount: 22, // Gold badge (20+)
      totalSales: "132.2",
      socialLinks: {
        website: "https://pixelprophet.io",
        twitter: "https://twitter.com/pixelprophet",
        instagram: "https://instagram.com/pixelprophet"
      }
    },
    {
      id: "3",
      name: "Crypto Canvas",
      bio: "Abstract expressions of blockchain technology and its impact on society.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      artCount: 15, // Red badge (10+)
      totalSales: "67.8",
      socialLinks: {
        website: "https://cryptocanvas.art",
        twitter: "https://twitter.com/cryptocanvas",
        instagram: "https://instagram.com/cryptocanvas",
        facebook: "https://facebook.com/cryptocanvas"
      }
    },
    {
      id: "4",
      name: "NFT Nomad",
      bio: "Traveling the digital realm to capture moments of virtual beauty.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      artCount: 6, // Blue badge (5+)
      totalSales: "18.3",
      socialLinks: {
        website: "https://nftnomad.com",
        twitter: "https://twitter.com/nftnomad",
        instagram: "https://instagram.com/nftnomad"
      }
    },
    {
      id: "5",
      name: "Abstract Artist",
      bio: "New to the platform, exploring digital art creation.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      artCount: 3, // No badge (less than 5)
      totalSales: "2.1",
      socialLinks: {
        website: "https://abstractartist.art",
        instagram: "https://instagram.com/abstractartist"
      }
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
          {/* My Profile Section - Only visible to registered artists */}
          {userIsRegisteredArtist && (
            <div className="mb-8">
              <MyProfile />
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Artist Profiles</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
