"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { AuctionBid, BidStatus } from "@/lib/auction-contract"
import { auctionContract } from "@/lib/auction-contract"
import { Badge } from "@/components/ui/badge"
import { Shield, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

interface EnhancedBidHistoryProps {
  auctionId: string
}

export function EnhancedBidHistory({ auctionId }: EnhancedBidHistoryProps) {
  const [bids, setBids] = useState<AuctionBid[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBids = async () => {
      try {
        // Get bids from auction contract
        const auctionBids = await auctionContract.getAuctionBids(auctionId)
        setBids(auctionBids)
      } catch (error) {
        console.error("Error fetching bid history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBids()
  }, [auctionId])

  // Get status badge for a bid
  const getStatusBadge = (status?: BidStatus) => {
    if (status === undefined) return null
    
    switch (status) {
      case BidStatus.Active:
        return (
          <Badge variant="default" className="ml-2 bg-green-600 hover:bg-green-700">
            Active
          </Badge>
        )
      case BidStatus.Outbid:
        return (
          <Badge variant="outline" className="ml-2">
            Outbid
          </Badge>
        )
      case BidStatus.Won:
        return (
          <Badge variant="default" className="ml-2 bg-yellow-600 hover:bg-yellow-700">
            Won
          </Badge>
        )
      case BidStatus.Completed:
        return (
          <Badge variant="default" className="ml-2 bg-blue-600 hover:bg-blue-700">
            Completed
          </Badge>
        )
      case BidStatus.Expired:
        return (
          <Badge variant="destructive" className="ml-2">
            Expired
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Bid History</h3>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Bid History</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-xs text-muted-foreground cursor-help">
                <Info className="h-3 w-3 mr-1" />
                <span>Secure Bidding</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>All bids require a small deposit (0.01 ETH) to ensure commitment. 
              Full payment is only required if you win the auction.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {bids.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bids placed yet.</p>
        ) : (
          bids.map((bid, index) => {
            const formattedAddress = `${bid.bidder.slice(0, 6)}...${bid.bidder.slice(-4)}`
            
            return (
              <div 
                key={index}
                className="flex justify-between text-sm py-2 px-3 border-b last:border-0 rounded-md bg-muted/50"
              >
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">{formattedAddress}</span>
                    {getStatusBadge(bid.status)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(bid.timestamp, { addSuffix: true })}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{bid.amount} ETH</div>
                  {bid.depositAmount && (
                    <div className="flex items-center justify-end text-xs text-muted-foreground">
                      <Shield className="h-3 w-3 mr-1" />
                      <span>{bid.depositAmount} ETH deposit</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-1 mb-2">
          <Shield className="h-3 w-3" />
          <span className="font-medium">About Secure Bidding</span>
        </div>
        <ul className="space-y-1 pl-4 list-disc">
          <li>All bids require a 0.01 ETH deposit</li>
          <li>Winners must complete payment within 24 hours</li>
          <li>Deposits are returned for outbid users</li>
        </ul>
      </div>
    </div>
  )
}
