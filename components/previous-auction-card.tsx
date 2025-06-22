import Image from "next/image"
import { format } from "date-fns"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface PreviousAuction {
  id: string
  title: string
  artist: string
  imageUrl: string
  soldFor: string
  soldDate: Date
  currentOwner: string
  bidCount: number // Add this line
}

interface PreviousAuctionCardProps {
  auction: PreviousAuction
}

export function PreviousAuctionCard({ auction }: PreviousAuctionCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3]">
        <Image src={auction.imageUrl || "/placeholder.svg"} alt={auction.title} fill className="object-cover" />
      </div>
      <CardContent className="pt-4">
        <h3 className="text-lg font-bold">{auction.title}</h3>
        <p className="text-sm text-muted-foreground">by {auction.artist}</p>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sold for:</span>
            <span className="font-bold">{auction.soldFor} ETH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sold on:</span>
            <span>{format(auction.soldDate, "MMM d, yyyy")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total bids:</span>
            <span>{auction.bidCount}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <div className="text-xs text-muted-foreground">Current owner:</div>
        <div className="font-mono text-sm">{auction.currentOwner}</div>
      </CardFooter>
    </Card>
  )
}
