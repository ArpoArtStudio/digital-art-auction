"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Award, Info, Shield, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useBiddingContext } from "@/contexts/bidding-context"
import { useChatContext } from "@/contexts/chat-context"
import { useWallet } from "@/contexts/wallet-context"
import { useFeatures } from "@/contexts/feature-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function BidButtons() {
  const { 
    getNextMinimumBid,
    placeBid,
    validateWalletForBid,
    currentBid
  } = useBiddingContext()
  
  const { isConnected, connectWallet } = useWallet()
  const { notifyBidPlaced, sendMessage } = useChatContext()
  const { features } = useFeatures()
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [bidType, setBidType] = useState<'min' | 'max'>('min')

  // Handle minimum bid (1%)
  const handleMinimumBid = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to place a bid")
      connectWallet()
      return
    }
    
    const bidAmount = getNextMinimumBid()
    
    // Validate user has funds before showing confirmation
    try {
      const validation = await validateWalletForBid(bidAmount)
      if (!validation.isValid) {
        toast.error(`Cannot place bid: ${validation.reason}`)
        return
      }
      
      // Show confirmation dialog
      setBidType('min')
      setShowConfirmDialog(true)
    } catch (error) {
      console.error("Error validating wallet:", error)
      toast.error("Could not validate wallet balance. Please try again.")
    }
  }
  
  // Handle maximum bid (10%)
  const handleMaximumBid = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to place a bid")
      connectWallet()
      return
    }
    
    const minBid = getNextMinimumBid()
    const maxBid = minBid * 10 // 10% maximum bid
    
    // Validate user has funds before showing confirmation
    try {
      const validation = await validateWalletForBid(maxBid)
      if (!validation.isValid) {
        toast.error(`Cannot place bid: ${validation.reason}`)
        return
      }
      
      // Show confirmation dialog
      setBidType('max')
      setShowConfirmDialog(true)
    } catch (error) {
      console.error("Error validating wallet:", error)
      toast.error("Could not validate wallet balance. Please try again.")
    }
  }
  
  // Handle bid confirmation
  const handleConfirmBid = async () => {
    setIsPlacingBid(true)
    const bidAmount = bidType === 'min' 
      ? getNextMinimumBid() 
      : getNextMinimumBid() * 10
    
    try {
      // Place bid with small deposit
      const success = await placeBid(bidAmount)
      
      if (success) {
        notifyBidPlaced()
        // Send a message to chat
        sendMessage(`I just placed a bid of ${bidAmount.toFixed(2)} ETH! 🎉`)
        toast.success(`Bid of ${bidAmount.toFixed(2)} ETH placed successfully!`)
        setShowConfirmDialog(false)
      } else {
        toast.error("Failed to place bid. Please try again.")
      }
    } catch (error) {
      console.error("Error placing bid:", error)
      toast.error("An error occurred while placing your bid")
    } finally {
      setIsPlacingBid(false)
    }
  }

  // Calculate bid amounts for display
  const minBidAmount = getNextMinimumBid()
  const maxBidAmount = minBidAmount * 10
  
  return (
    <div className="flex flex-col gap-2 w-full">
      <Button
        variant="default"
        size="lg"
        className="w-full flex items-center justify-center gap-2"
        disabled={isPlacingBid || !isConnected}
        onClick={handleMaximumBid}
      >
        <ArrowUp className="h-4 w-4" />
        Max Bid (10%) - {maxBidAmount.toFixed(2)} ETH
      </Button>
      
      <Button
        variant="outline"
        size="lg"
        className="w-full flex items-center justify-center gap-2"
        disabled={isPlacingBid || !isConnected}
        onClick={handleMinimumBid}
      >
        <Award className="h-4 w-4" />
        Min Bid (1%) - {minBidAmount.toFixed(2)} ETH
      </Button>
      
      {isConnected && (
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Info className="h-3 w-3" />
          <p>Placing a bid requires a small deposit (0.01 ETH) and commits you to payment if you win.</p>
        </div>
      )}
      
      {/* Bid Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Your Bid</DialogTitle>
            <DialogDescription>
              Please review the bidding terms before confirming.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert>
              <AlertTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                How Our Secure Bidding Works
              </AlertTitle>
              <AlertDescription>
                <ol className="list-decimal pl-5 space-y-1 mt-2">
                  <li>A small deposit (0.01 ETH) is required to place your bid</li>
                  <li>If you win, you'll need to complete the full payment within 24 hours</li>
                  <li>If you don't win, your deposit will be returned automatically</li>
                </ol>
              </AlertDescription>
            </Alert>
            
            <div className="bg-muted p-3 rounded-md">
              <div className="font-medium mb-2">Your Bid Details:</div>
              <div className="flex justify-between text-sm">
                <span>Current highest bid:</span>
                <span>{currentBid.toFixed(2)} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Your bid amount:</span>
                <span className="font-medium">
                  {bidType === 'min' ? minBidAmount.toFixed(2) : maxBidAmount.toFixed(2)} ETH
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Initial deposit:</span>
                <span>0.01 ETH</span>
              </div>
              {features.enableNFTRoyalties && (
                <div className="flex justify-between text-sm">
                  <span>Artist royalty (5%):</span>
                  <span>{bidType === 'min' ? (minBidAmount * 0.05).toFixed(2) : (maxBidAmount * 0.05).toFixed(2)} ETH</span>
                </div>
              )}
              <div className="flex justify-between text-sm border-t border-border mt-2 pt-2">
                <span>Required if you win:</span>
                <span className="font-bold">
                  {bidType === 'min' ? (minBidAmount - 0.01).toFixed(2) : (maxBidAmount - 0.01).toFixed(2)} ETH
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Binding Agreement</p>
                  <p className="text-muted-foreground">Your bid is a legal commitment to purchase if you win</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">24-Hour Payment Window</p>
                  <p className="text-muted-foreground">You'll have 24 hours to complete payment if you win</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={isPlacingBid}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmBid}
              disabled={isPlacingBid}
            >
              {isPlacingBid ? 'Processing...' : 'Place Bid with 0.01 ETH Deposit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
