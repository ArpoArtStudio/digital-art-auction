import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFeatures } from "@/contexts/feature-context"
import { ExternalLink, Instagram, Twitter, Facebook, Globe } from "lucide-react"

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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full bg-gradient-to-b from-primary/20 to-muted">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <Image
              src={artist.avatarUrl || "/placeholder.svg"}
              alt={artist.name}
              width={100}
              height={100}
              className="rounded-full border-4 border-background"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-16 text-center">
        <h3 className="text-xl font-bold">{artist.name}</h3>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{artist.bio}</p>
        
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
        
        <div className="flex justify-center gap-8 mt-4">
          <div>
            <div className="font-bold">{artist.artCount}</div>
            <div className="text-xs text-muted-foreground">Artworks</div>
          </div>
          <div>
            <div className="font-bold">{artist.totalSales} ETH</div>
            <div className="text-xs text-muted-foreground">Total Sales</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        {features.enablePublicArtistProfiles ? (
          <Link href={`/artists/${artist.id}`}>
            <Button variant="outline">View Profile</Button>
          </Link>
        ) : (
          <Button variant="outline" disabled>Profiles Not Public</Button>
        )}
      </CardFooter>
    </Card>
  )
}
