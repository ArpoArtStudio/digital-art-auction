"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Shield, ArrowUp, Clock } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { WalletFallback } from "@/components/wallet-fallback"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CountdownTimer } from "./countdown-timer"
import { useSmartContractBidding } from "@/hooks/use-smart-contract-bidding"
import { toast } from "sonner"

export default function CurrentAuction() {
  const { isConnected, connectWallet } = useWallet()
  const [isPlacingMinBid, setIsPlacingMinBid] = useState(false)
  const [isPlacingMaxBid, setIsPlacingMaxBid] = useState(false)
  
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
  
  // Display current bid from smart contract or starting bid if not set
  const displayBid = currentBid || auction.currentBid
  
  // Calculate minimum and maximum bids
  const minBidAmount = displayBid * 1.01 // 1% increment
  const maxBidAmount = displayBid * 1.10 // 10% increment
  
  // Check if auction is ending soon
  const timeRemaining = auction.endTime.getTime() - Date.now()
  const isEndingSoon = timeRemaining < 24 * 60 * 60 * 1000 // Less than 24 hours
  const isEnded = timeRemaining <= 0
  
  // Load auction data when the component mounts
  useEffect(() => {
    loadAuctionData()
  }, [loadAuctionData])
  
  if (typeof window !== "undefined" && !window.ethereum) {
    return (
      <div className="container py-8">
        <WalletFallback />
      </div>
    )
  }
  
  // Handle minimum bid (1%)
  const handleMinimumBid = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to place a bid")
      connectWallet()
      return
    }
    
    setIsPlacingMinBid(true)
    
    try {
      // First verify funds
      const hasFunds = await verifyFunds(minBidAmount)
      if (!hasFunds) {
        return
      }
      
      // Place bid
      const success = await placeBid(minBidAmount)
      if (success) {
        // Refresh auction data
        loadAuctionData()
      }
    } catch (error) {
      console.error("Error placing minimum bid:", error)
      toast.error("Failed to place bid. Please try again.")
    } finally {
      setIsPlacingMinBid(false)
    }
  }
  
  // Handle maximum bid (10%)
  const handleMaximumBid = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to place a bid")
      connectWallet()
      return
    }
    
    setIsPlacingMaxBid(true)
    
    try {
      // First verify funds
      const hasFunds = await verifyFunds(maxBidAmount)
      if (!hasFunds) {
        return
      }
      
      // Place bid
      const success = await placeBid(maxBidAmount)
      if (success) {
        // Refresh auction data
        loadAuctionData()
      }
    } catch (error) {
      console.error("Error placing maximum bid:", error)
      toast.error("Failed to place bid. Please try again.")
    } finally {
      setIsPlacingMaxBid(false)
    }
  }

  if (isEnded) {
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
            <Card>
              <CardHeader>
                <CardTitle>Auction Ended</CardTitle>
                <CardDescription>
                  Final price: {displayBid.toFixed(2)} ETH
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Auction Complete</AlertTitle>
                  <AlertDescription>
                    {hasBid ? 
                      "You won! The NFT will be transferred to your wallet automatically." :
                      "This auction has ended. The NFT was transferred to the winning bidder."
                    }
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image
              src={auction.imageUrl || "/placeholder.svg"}
              alt={auction.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 66vw"
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

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Current Auction</CardTitle>
                  <CardDescription>
                    Token ID: {auction.tokenId}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Current bid</div>
                  <div className="text-2xl font-bold">{displayBid.toFixed(2)} ETH</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className={`font-medium whitespace-nowrap ${isEndingSoon ? 'text-red-500' : ''}`}>
                    Auction ending in
                  </span>
                </div>
                <CountdownTimer targetDate={auction.endTime} />
              </div>
              
              {hasBid && (
                <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                  <AlertDescription className="text-green-800 dark:text-green-300">
                    You have an active bid on this auction. If you win, payment will be automatically processed.
                  </AlertDescription>
                </Alert>
              )}
              
              {!isConnected ? (
                <Button 
                  className="w-full" 
                  onClick={connectWallet}
                >
                  Connect Wallet to Bid
                </Button>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                    disabled={isBidding || isPlacingMinBid || isPlacingMaxBid}
                    onClick={handleMaximumBid}
                  >
                    <ArrowUp className="h-4 w-4" />
                    Max Bid: {maxBidAmount.toFixed(2)} ETH
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                    disabled={isBidding || isPlacingMinBid || isPlacingMaxBid}
                    onClick={handleMinimumBid}
                  >
                    <ArrowUp className="h-4 w-4" />
                    Min Bid: {minBidAmount.toFixed(2)} ETH
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    By placing a bid, you agree to automatic payment processing if you win
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
