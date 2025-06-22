"use client"

import { useState } from "react"
import Image from "next/image"
import { Clock, Users, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CountdownTimer } from "@/components/countdown-timer"
import { BidHistory } from "@/components/bid-history"
import { useWallet } from "@/contexts/wallet-context"
import { WalletFallback } from "@/components/wallet-fallback"
import { useBiddingSystem } from "@/hooks/use-bidding-system"
import { toast } from "sonner"
import { SecureBiddingUi } from "@/components/secure-bidding-ui" // Import our secure bidding UI

export default function CurrentAuction() {
  const [bidAmount, setBidAmount] = useState("")
  const [showBidHistory, setShowBidHistory] = useState(false)
  const { isConnected, connectWallet } = useWallet()
  const { placeBid, userLevel, userBidCount } = useBiddingSystem()

  // Placeholder auction data
  const auction = {
    id: "1",
    title: "Ethereal Dimensions",
    artist: "Digital Visionary",
    description:
      "A mesmerizing exploration of digital landscapes that blur the boundaries between reality and imagination.",
    imageUrl: "/placeholder.svg?height=800&width=1200",
    currentBid: "0.85",
    minimumBid: "0.9",
    bidCount: 12,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  }

  const handleBid = async () => {
    if (!isConnected) {
      await connectWallet()
      return
    }

    if (!bidAmount || Number.parseFloat(bidAmount) < Number.parseFloat(auction.minimumBid)) {
      toast.error(`Minimum bid is ${auction.minimumBid} ETH`)
      return
    }

    try {
      // Place the bid in the auction system
      console.log(`Placing bid of ${bidAmount} ETH`)
      toast.success(`Bid of ${bidAmount} ETH placed successfully! (Demo mode)`)
      
      // Update bidding level in chat system
      const { newBidCount, newLevel, leveledUp } = placeBid();
      
      // Show bid count in console for demo
      console.log(`Total bid count for user: ${newBidCount}`)
      
      // Update the auction UI to show the latest bid
      auction.bidCount += 1
      auction.currentBid = bidAmount
      
      setBidAmount("")
    } catch (error) {
      console.error("Error placing bid:", error)
      toast.error("Failed to place bid. Please try again.")
    }
  }

  if (typeof window !== "undefined" && !window.ethereum) {
    return (
      <div className="container py-8">
        <WalletFallback />
      </div>
    )
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-end mb-4">
        <div className="flex items-center space-x-2 bg-muted p-2 rounded-md">
          <Shield className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Secure Bidding System</span>
          <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-400/10 text-green-400">
            Active
          </div>
        </div>
      </div>
      
      {/* Secure Bidding UI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src={auction.imageUrl || "/placeholder.svg"}
              alt={auction.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <div className="mt-6">
            <h1 className="text-3xl font-bold">{auction.title}</h1>
            <p className="text-lg text-muted-foreground">by {auction.artist}</p>
            
            <div className="mt-4 space-y-2">
              <h2 className="text-xl font-semibold">About this piece</h2>
              <p className="text-muted-foreground">{auction.description}</p>
            </div>
          </div>
        </div>
        
        <div>
          <SecureBiddingUi
            auctionId={auction.id}
            tokenId="NFT-123"
            artworkName={auction.title}
            currentBid={Number(auction.currentBid)}
            endTime={auction.endTime}
          />
        </div>
      </div>
    </div>
  )
}
