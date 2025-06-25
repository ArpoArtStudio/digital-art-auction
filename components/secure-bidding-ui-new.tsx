"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@/contexts/wallet-context"
import { useSmartContractBidding } from "@/hooks/use-smart-contract-bidding"
import { CountdownTimer } from "./countdown-timer"
import { Clock, Shield, AlertTriangle, ArrowUp, Award } from "lucide-react"
import { toast } from "sonner"

interface SecureBiddingUiProps {
  auctionId: string
  tokenId: string
  artworkName: string
  artworkImage?: string
  currentBid: number
  endTime: Date
  isEnded?: boolean
  hasBid?: boolean
}

export function SecureBiddingUi({
  auctionId,
  tokenId,
  artworkName,
  artworkImage,
  currentBid,
  endTime,
  isEnded = false,
  hasBid = false
}: SecureBiddingUiProps) {
  const { isConnected, connectWallet } = useWallet()
  const [isPlacingMinBid, setIsPlacingMinBid] = useState(false)
  const [isPlacingMaxBid, setIsPlacingMaxBid] = useState(false)
  const [isVerifyingFunds, setIsVerifyingFunds] = useState(false)
  
  const { 
    verifyFunds,
    placeBid,
    isBidding,
    loadAuctionData
  } = useSmartContractBidding(auctionId)
  
  // Calculate minimum and maximum bids
  const minBidAmount = currentBid * 1.01 // 1% increment
  const maxBidAmount = currentBid * 1.10 // 10% increment
  
  const timeRemaining = endTime.getTime() - Date.now()
  const isEndingSoon = timeRemaining < 24 * 60 * 60 * 1000 // Less than 24 hours
  
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
      setIsVerifyingFunds(true)
      const hasFunds = await verifyFunds(minBidAmount)
      setIsVerifyingFunds(false)
      
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
      setIsVerifyingFunds(false)
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
      setIsVerifyingFunds(true)
      const hasFunds = await verifyFunds(maxBidAmount)
      setIsVerifyingFunds(false)
      
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
      setIsVerifyingFunds(false)
    }
  }
  
  if (isEnded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Auction Ended</CardTitle>
          <CardDescription>
            Final price: {currentBid.toFixed(2)} ETH
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
    )
  }
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="card-responsive">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl break-words">{artworkName}</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Token ID: {tokenId}
              </CardDescription>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className="text-xs sm:text-sm text-muted-foreground">Current bid</div>
              <div className="text-xl sm:text-2xl font-bold">{currentBid.toFixed(2)} ETH</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {artworkImage && (
            <div className="aspect-square w-full overflow-hidden rounded-md">
              <img 
                src={artworkImage} 
                alt={artworkName} 
                className="object-cover w-full h-full"
              />
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className={`font-medium text-sm sm:text-base whitespace-nowrap ${isEndingSoon ? 'text-red-500' : ''}`}>
                {isEndingSoon ? 'Ending soon!' : 'Auction ending in'}
              </span>
            </div>
            <div className="w-full sm:w-auto">
              <CountdownTimer targetDate={endTime} />
            </div>
          </div>
          
          {hasBid && (
            <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
              <AlertTriangle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-300 text-sm">
                You have an active bid on this auction. If you win, payment will be automatically processed.
              </AlertDescription>
            </Alert>
          )}
          
          {!isConnected ? (
            <Button 
              className="w-full text-sm sm:text-base py-2 sm:py-3" 
              onClick={connectWallet}
            >
              Connect Wallet to Bid
            </Button>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <Button
                variant="default"
                size="lg"
                className="w-full flex items-center justify-center gap-2 text-sm sm:text-base py-2 sm:py-3"
                disabled={isBidding || isVerifyingFunds}
                onClick={handleMaximumBid}
              >
                <ArrowUp className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">Max Bid (10%) - {maxBidAmount.toFixed(2)} ETH</span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2 text-sm sm:text-base py-2 sm:py-3"
                disabled={isBidding || isVerifyingFunds}
                onClick={handleMinimumBid}
              >
                <Award className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">Min Bid (1%) - {minBidAmount.toFixed(2)} ETH</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
