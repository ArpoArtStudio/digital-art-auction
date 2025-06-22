import { SiteHeader } from "@/components/site-header"
import { ArtistCard } from "@/components/artist-card"

export default function ArtistsPage() {
  // Placeholder artist data
  const artists = [
    {
      id: "1",
      name: "Digital Visionary",
      bio: "Creating ethereal digital landscapes that blur the boundaries between reality and imagination.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      artCount: 12,
      totalSales: "45.5",
    },
    {
      id: "2",
      name: "Pixel Prophet",
      bio: "Exploring the intersection of traditional art techniques and digital innovation.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      artCount: 8,
      totalSales: "32.2",
    },
    {
      id: "3",
      name: "Crypto Canvas",
      bio: "Abstract expressions of blockchain technology and its impact on society.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      artCount: 15,
      totalSales: "67.8",
    },
    {
      id: "4",
      name: "NFT Nomad",
      bio: "Traveling the digital realm to capture moments of virtual beauty.",
      avatarUrl: "/placeholder.svg?height=200&width=200",
      artCount: 6,
      totalSales: "18.3",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8">Artist Profiles</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
