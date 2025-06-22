"use client"

import React from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useBiddingContext } from "@/contexts/bidding-context"
import { useWallet } from "@/contexts/wallet-context"

interface BidHistoryEntry {
  id: string
  walletAddress: string
  displayName: string
  amount: number
  timestamp: string
}

export function BidHistoryDisplay() {
  // Mock bid history for demo purposes
  const [bidHistory, setBidHistory] = React.useState<BidHistoryEntry[]>([
    {
      id: "1",
      walletAddress: "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0",
      displayName: "0xec24...350a0",
      amount: 120,
      timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      id: "2",
      walletAddress: "0x1234567890123456789012345678901234567890",
      displayName: "0x1234...7890",
      amount: 115,
      timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    },
    {
      id: "3",
      walletAddress: "0x2345678901234567890123456789012345678901",
      displayName: "0x2345...8901",
      amount: 110,
      timestamp: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
    }
  ])
  
  const { currentBid, getNextMinimumBid, maxBidIncrementPercentage } = useBiddingContext()
  const { walletAddress } = useWallet()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bid History</CardTitle>
        <CardDescription>Recent bids for the current auction</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Auction bid history</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Bidder</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bidHistory.map((bid) => (
              <TableRow key={bid.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {bid.displayName}
                    {bid.walletAddress.toLowerCase() === walletAddress.toLowerCase() && (
                      <Badge variant="outline">You</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">{bid.amount.toFixed(2)} ETH</TableCell>
                <TableCell className="text-right">{format(new Date(bid.timestamp), "h:mm a")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4 p-3 bg-muted rounded-md">
          <h4 className="text-sm font-medium mb-2">Bidding Rules</h4>
          <div className="space-y-1 text-sm">
            <p>Current Bid: {currentBid.toFixed(2)} ETH</p>
            <p>Min Next Bid: {getNextMinimumBid().toFixed(2)} ETH</p>
            <p>Max Increment: {(currentBid * maxBidIncrementPercentage).toFixed(2)} ETH</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
