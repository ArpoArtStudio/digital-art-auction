'use client';

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFeatures } from "@/contexts/feature-context"
import { ExternalLink, Instagram, Twitter, Facebook, Globe } from "lucide-react"
import { getArtistBadge } from "@/lib/artist-utils"
import { ArtistBadge } from "@/components/artist-badge"

interface Artist {
  id: string
  name: string
  bio: string
  avatarUrl: string
  artCount: number
  totalSales: string
  socialLinks?: {
    website?: string
    twitter?: string
    instagram?: string
    facebook?: string
  }
}

interface ArtistCardProps {
  artist: Artist
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const { features } = useFeatures();

  // Get badge based on artwork count (simulating submission count)
  const badge = getArtistBadge(artist.artCount)

  return (
    <Card className="overflow-hidden card-responsive">
      <CardHeader className="p-0">
        <div className="relative h-32 sm:h-40 lg:h-48 w-full bg-gradient-to-b from-primary/20 to-muted">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <Image
              src={artist.avatarUrl || "/placeholder.svg"}
              alt={artist.name}
              width={80}
              height={80}
              className="rounded-full border-4 border-background sm:w-[90px] sm:h-[90px] lg:w-[100px] lg:h-[100px]"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-12 sm:pt-14 lg:pt-16 text-center px-4 sm:px-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-lg sm:text-xl font-bold break-words">{artist.name}</h3>
          {badge && (
            <ArtistBadge badge={badge} size="sm" />
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-3">{artist.bio}</p>
        
        {/* Social Media Links */}
        {artist.socialLinks && (
          <div className="flex justify-center gap-2 mt-3">
            {artist.socialLinks.website && (
              <a 
                href={artist.socialLinks.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
            {artist.socialLinks.twitter && (
              <a 
                href={artist.socialLinks.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {artist.socialLinks.instagram && (
              <a 
                href={artist.socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {artist.socialLinks.facebook && (
              <a 
                href={artist.socialLinks.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
        
        <div className="flex justify-center gap-4 sm:gap-6 lg:gap-8 mt-4">
          <div className="text-center">
            <div className="font-bold text-sm sm:text-base">{artist.artCount}</div>
            <div className="text-xs text-muted-foreground">Artworks</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-sm sm:text-base break-words">{artist.totalSales} ETH</div>
            <div className="text-xs text-muted-foreground">Total Sales</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center px-4 sm:px-6">
        {features.enablePublicArtistProfiles ? (
          <Link href={`/artists/${artist.id}`}>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">View Profile</Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" disabled>Profiles Not Public</Button>
        )}
      </CardFooter>
    </Card>
  )
}
