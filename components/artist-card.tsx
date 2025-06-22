import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Artist {
  id: string
  name: string
  bio: string
  avatarUrl: string
  artCount: number
  totalSales: string
}

interface ArtistCardProps {
  artist: Artist
}

export function ArtistCard({ artist }: ArtistCardProps) {
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
        <Link href={`/artists/${artist.id}`}>
          <Button variant="outline">View Profile</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
