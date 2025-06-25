"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useWallet } from "@/contexts/wallet-context"
import { CountdownTimer } from "./countdown-timer"
import { BidButtons } from "./bid-buttons"
import { BidHistory } from "./bid-history"
import { UserAuctions } from "./user-auctions"
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
}

export function SecureBiddingUi({
  auctionId,
  tokenId,
  artworkName,
  artworkImage,
  currentBid,
  endTime,
  isEnded = false
}: SecureBiddingUiProps) {
  const { isConnected, connectWallet, walletAddress } = useWallet()
  const [isVerifyingFunds, setIsVerifyingFunds] = useState(false)
  const [isBidding, setIsBidding] = useState(false)
  const [hasBid, setHasBid] = useState(false)
  
  // Calculate minimum and maximum bids
  const minBidAmount = currentBid * 1.01 // 1% increment
  const maxBidAmount = currentBid * 1.10 // 10% increment
  
  // Verify funds in user's wallet before allowing bid
  const verifyFunds = async (bidAmount: number): Promise<boolean> => {
    // Mock verification for demo purposes
    return true
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
  
  const timeRemaining = endTime.getTime() - Date.now()
  const isEndingSoon = timeRemaining < 24 * 60 * 60 * 1000 // Less than 24 hours
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{artworkName}</CardTitle>
              <CardDescription>
                Token ID: {tokenId}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Current bid</div>
              <div className="text-2xl font-bold">{currentBid} ETH</div>
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span className={`font-medium ${isEndingSoon ? 'text-red-500' : ''}`}>
                {isEndingSoon ? 'Ending soon!' : 'Auction ending in'}
              </span>
            </div>
            <CountdownTimer targetDate={endTime} />
          </div>
          
          {!isConnected ? (
            <Button 
              className="w-full" 
              onClick={connectWallet}
            >
              Connect Wallet to Bid
            </Button>
          ) : (
            <BidButtons />
          )}
        </CardContent>
        
        <CardFooter className="flex-col">
          <BidHistory auctionId={auctionId} />
        </CardFooter>
      </Card>
      
      {isConnected && (
        <UserAuctions />
      )}
    </div>
  )
}
