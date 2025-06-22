"use client"

import React, { useEffect, useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { auctionContract, AuctionDetails, PaymentStatus } from "@/lib/auction-contract"
import { formatDistanceToNow } from "date-fns"
import { PaymentCompletion } from "./payment-completion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface WonAuction {
  auction: AuctionDetails
  bidAmount: string
  depositAmount: string
  paymentStatus: PaymentStatus
}

export function UserAuctions() {
  const { isConnected, walletAddress } = useWallet()
  const [isLoading, setIsLoading] = useState(true)
  const [wonAuctions, setWonAuctions] = useState<WonAuction[]>([])
  const [activeAuctions, setActiveAuctions] = useState<AuctionDetails[]>([])

  useEffect(() => {
    const fetchUserAuctions = async () => {
      if (!isConnected) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        
        // This would be a contract call to get all auctions the user has participated in
        // For demo purposes, we'll use mock data
        
        // Mock for won auctions
        const mockWonAuctions: WonAuction[] = [
          {
            auction: {
              id: "auction-123",
              tokenId: "123",
              contractAddress: "0xContract",
              seller: "0xSeller",
              highestBidder: walletAddress,
              highestBid: "1.5",
              startingPrice: "1.0",
              startTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
              endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              ended: true,
              paymentDeadline: new Date(Date.now() + 23 * 60 * 60 * 1000), // 23 hours from now
            },
            bidAmount: "1.5",
            depositAmount: "0.01",
            paymentStatus: PaymentStatus.Pending
          },
          {
            auction: {
              id: "auction-456",
              tokenId: "456",
              contractAddress: "0xContract2",
              seller: "0xSeller2",
              highestBidder: walletAddress,
              highestBid: "2.75",
              startingPrice: "2.0",
              startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
              endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              ended: true,
              paymentDeadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            },
            bidAmount: "2.75",
            depositAmount: "0.01",
            paymentStatus: PaymentStatus.Expired
          }
        ]
        
        // Mock for active auctions where user has placed bids
        const mockActiveAuctions: AuctionDetails[] = [
          {
            id: "auction-789",
            tokenId: "789",
            contractAddress: "0xContract3",
            seller: "0xSeller3",
            highestBidder: "0xSomeoneElse",
            highestBid: "3.2",
            startingPrice: "1.5",
            startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            ended: false
          },
          {
            id: "auction-101",
            tokenId: "101",
            contractAddress: "0xContract4",
            seller: "0xSeller4",
            highestBidder: walletAddress,
            highestBid: "4.0",
            startingPrice: "3.0",
            startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            ended: false
          }
        ]
        
        setWonAuctions(mockWonAuctions)
        setActiveAuctions(mockActiveAuctions)
      } catch (error) {
        console.error("Error fetching user auctions:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserAuctions()
  }, [isConnected, walletAddress])

  if (!isConnected) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Wallet not connected</AlertTitle>
        <AlertDescription>
          Please connect your wallet to view your auctions.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Your Auctions</h2>
      
      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">
            Required Payments
            {wonAuctions.some(a => a.paymentStatus === PaymentStatus.Pending) && (
              <span className="ml-2 rounded-full bg-red-500 px-2 text-xs text-white">
                {wonAuctions.filter(a => a.paymentStatus === PaymentStatus.Pending).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Active Bids</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="space-y-4">
          {wonAuctions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payments required</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {wonAuctions.map((wonAuction) => (
                <PaymentCompletion
                  key={wonAuction.auction.id}
                  auctionId={wonAuction.auction.id}
                  artworkName={`Artwork #${wonAuction.auction.tokenId}`}
                  bidAmount={wonAuction.bidAmount}
                  depositAmount={wonAuction.depositAmount}
                  paymentDeadline={wonAuction.auction.paymentDeadline!}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {activeAuctions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No active bids</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activeAuctions.map((auction) => (
                <Card key={auction.id}>
                  <CardHeader>
                    <CardTitle>Artwork #{auction.tokenId}</CardTitle>
                    <CardDescription>
                      {auction.highestBidder === walletAddress ? (
                        <span className="text-green-500 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          You're the highest bidder!
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          You've placed a bid on this auction
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current highest bid:</span>
                        <span className="font-medium">{auction.highestBid} ETH</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">
                            Ends {formatDistanceToNow(auction.endTime, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
