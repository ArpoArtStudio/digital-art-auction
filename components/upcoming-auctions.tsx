"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export function UpcomingAuctions() {
  // Mock upcoming auctions data
  const upcomingAuctions = [
    {
      id: "1",
      title: "Cosmic Dreams",
      artist: "Digital Visionary",
      imageUrl: "/placeholder.svg?height=200&width=300",
      startingPrice: "0.5",
      queuePosition: 1,
      category: "Digital Art",
    },
    {
      id: "2",
      title: "Neon Nights",
      artist: "Pixel Prophet",
      imageUrl: "/placeholder.svg?height=200&width=300",
      startingPrice: "0.8",
      queuePosition: 2,
      category: "Photography",
    },
    {
      id: "3",
      title: "Abstract Reality",
      artist: "Crypto Canvas",
      imageUrl: "/placeholder.svg?height=200&width=300",
      startingPrice: "1.2",
      queuePosition: 3,
      category: "3D Models",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Up Next</h2>
        <p className="text-muted-foreground">Upcoming auctions in the queue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {upcomingAuctions.map((auction) => (
          <Card key={auction.id} className="overflow-hidden">
            <div className="relative aspect-[4/3]">
              <Image src={auction.imageUrl || "/placeholder.svg"} alt={auction.title} fill className="object-cover" />
              <div className="absolute top-2 left-2">
                <Badge variant="secondary">#{auction.queuePosition}</Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{auction.title}</CardTitle>
              <p className="text-sm text-muted-foreground">by {auction.artist}</p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Starting at</p>
                  <p className="font-bold">{auction.startingPrice} ETH</p>
                </div>
                <Badge variant="outline">{auction.category}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
