import { SiteHeader } from "@/components/site-header"
import { PreviousAuctionCard } from "@/components/previous-auction-card"

export default function PreviousAuctionsPage() {
  // Placeholder previous auction data
  const previousAuctions = [
    {
      id: "1",
      title: "Digital Dreamscape",
      artist: "Digital Visionary",
      imageUrl: "/placeholder.svg?height=400&width=600",
      soldFor: "2.5",
      soldDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      currentOwner: "0x1234...5678",
      bidCount: 15,
    },
    {
      id: "2",
      title: "Pixel Paradise",
      artist: "Pixel Prophet",
      imageUrl: "/placeholder.svg?height=400&width=600",
      soldFor: "1.8",
      soldDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      currentOwner: "0x8765...4321",
      bidCount: 8,
    },
    {
      id: "3",
      title: "Blockchain Bliss",
      artist: "Crypto Canvas",
      imageUrl: "/placeholder.svg?height=400&width=600",
      soldFor: "3.2",
      soldDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      currentOwner: "0x5432...8765",
      bidCount: 23,
    },
    {
      id: "4",
      title: "Virtual Vistas",
      artist: "NFT Nomad",
      imageUrl: "/placeholder.svg?height=400&width=600",
      soldFor: "1.5",
      soldDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      currentOwner: "0x9876...5432",
      bidCount: 12,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8">Previous Auctions</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousAuctions.map((auction) => (
              <PreviousAuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
