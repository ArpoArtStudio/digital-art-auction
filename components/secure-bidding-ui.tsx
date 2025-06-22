"use client"

import { useState, useEffect } from "react"
import { BidButtons } from "./bid-buttons"
import { BidHistory } from "./bid-history"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/contexts/wallet-context"
import { useBiddingContext } from "@/contexts/bidding-context"
import { CountdownTimer } from "./countdown-timer"
import { formatDistanceToNow } from "date-fns"
import { Clock, Shield, CheckCircle, AlertTriangle } from "lucide-react"
import { UserAuctions } from "./user-auctions"

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
  const { isConnected, connectWallet } = useWallet()
  const [depositAmount, setDepositAmount] = useState("0.01") // ETH
  
  // Simulate fetching deposit amount from the contract
  useEffect(() => {
    const getDepositAmount = async () => {
      // In production, this would call the contract
      // For now, we'll use the fixed value
      setDepositAmount("0.01")
    }
    
    getDepositAmount()
  }, [])
  
  if (isEnded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Auction Ended</CardTitle>
          <CardDescription>
            This auction has ended. Final price: {currentBid} ETH
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Auction Complete</AlertTitle>
            <AlertDescription>
              This auction has ended and the winner has been notified to complete payment.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <BidHistory auctionId={auctionId} />
        </CardFooter>
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
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Secure Bidding System</AlertTitle>
            <AlertDescription className="text-sm">
              <p className="mb-2">This auction uses our secure bidding system:</p>
              <ul className="space-y-1 list-disc pl-5">
                <li>Place bids with just a {depositAmount} ETH deposit</li>
                <li>Full payment only required if you win</li>
                <li>All transactions secured by our smart contract</li>
              </ul>
            </AlertDescription>
          </Alert>
          
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
