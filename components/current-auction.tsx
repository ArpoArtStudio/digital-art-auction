"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Shield } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { WalletFallback } from "@/components/wallet-fallback"
import { SecureBiddingUi } from "@/components/secure-bidding-ui-new" // Use our new bidding UI
import { useSmartContractBidding } from "@/hooks/use-smart-contract-bidding" // Use our new bidding hook
import { Card, CardContent } from "@/components/ui/card"

export default function CurrentAuction() {
  const { isConnected } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Placeholder auction data
  const auction = {
    id: "1",
    title: "Ethereal Dimensions",
    artist: "Digital Visionary",
    description:
      "A mesmerizing exploration of digital landscapes that blur the boundaries between reality and imagination.",
    imageUrl: "/placeholder.svg?height=800&width=1200",
    currentBid: 0.85,
    tokenId: "NFT-123",
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  }
  
  const { 
    currentBid, 
    hasBid, 
    loadAuctionData,
    verifyFunds,
    placeBid,
    isBidding
  } = useSmartContractBidding(auction.id)
  
  // Load auction data when the component mounts
  useEffect(() => {
    loadAuctionData()
  }, [loadAuctionData])
  
  // Calculate the displayed bid (use the latest from smart contract if available)
  const displayBid = currentBid || auction.currentBid
  
  // Handle bid placement from the UI
  const handlePlaceBid = async (isBidMax: boolean) => {
    if (isProcessing) return
    
    setIsProcessing(true)
    try {
      const bidAmount = isBidMax 
        ? displayBid * 1.1  // 10% increment for max bid
        : displayBid * 1.01 // 1% increment for min bid
        
      // First verify funds
      const hasFunds = await verifyFunds(bidAmount)
      if (!hasFunds) {
        return false
      }
      
      // Then place the bid
      await placeBid(bidAmount)
      
      // Refresh auction data
      loadAuctionData()
    } finally {
      setIsProcessing(false)
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
        </div>
        
        <div className="space-y-4">
          {/* Artwork Details - Always on the right */}
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-xl lg:text-2xl font-bold break-words mb-2">{auction.title}</h1>
              <p className="text-base text-muted-foreground mb-4">by {auction.artist}</p>
              
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">About this piece</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{auction.description}</p>
              </div>
            </CardContent>
          </Card>

          <SecureBiddingUi
            auctionId={auction.id}
            tokenId={auction.tokenId}
            artworkName={auction.title}
            currentBid={displayBid}
            endTime={auction.endTime}
            isEnded={false}
            hasBid={hasBid}
          />
        </div>
      </div>
    </div>
  )
}
