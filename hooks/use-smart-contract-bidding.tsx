"use client"

import { useState } from 'react'
import { useWallet } from '@/contexts/wallet-context'
import { smartContractService } from '@/lib/smart-contract-service'
import { toast } from 'sonner'

export function useSmartContractBidding(auctionId: string) {
  const { isConnected, walletAddress, connectWallet } = useWallet()
  const [isVerifyingFunds, setIsVerifyingFunds] = useState(false)
  const [isBidding, setIsBidding] = useState(false)
  const [hasBid, setHasBid] = useState(false)
  const [currentBid, setCurrentBid] = useState<number | null>(null)
  const [isLoadingAuction, setIsLoadingAuction] = useState(false)

  // Load auction data
  const loadAuctionData = async () => {
    if (!auctionId) return
    
    setIsLoadingAuction(true)
    try {
      const auction = await smartContractService.getAuction(auctionId)
      if (auction) {
        setCurrentBid(auction.currentBid)
        
        // Check if user has a bid on this auction
        if (isConnected && walletAddress && auction.bids.some(bid => bid.bidder === walletAddress)) {
          setHasBid(true)
        }
      }
    } catch (error) {
      console.error("Error loading auction data:", error)
    } finally {
      setIsLoadingAuction(false)
    }
  }

  // Verify funds in user's wallet before allowing bid
  const verifyFunds = async (bidAmount: number): Promise<boolean> => {
    if (!isConnected || !walletAddress) {
      toast.error("Please connect your wallet")
      connectWallet()
      return false
    }
    
    setIsVerifyingFunds(true)
    try {
      const hasSufficientFunds = await smartContractService.verifyFunds(walletAddress, bidAmount)
      
      if (!hasSufficientFunds) {
        toast.error(`Insufficient funds. You need at least ${bidAmount.toFixed(2)} ETH to place this bid.`)
        return false
      }
      
      return true
    } catch (error) {
      console.error("Error verifying funds:", error)
      toast.error("Could not verify wallet balance")
      return false
    } finally {
      setIsVerifyingFunds(false)
    }
  }
  
  // Place a bid
  const placeBid = async (bidAmount: number): Promise<boolean> => {
    if (!isConnected || !walletAddress) {
      toast.error("Please connect your wallet to place a bid")
      connectWallet()
      return false
    }
    
    setIsBidding(true)
    
    try {
      // Verify user has funds before allowing bid
      const hasSufficientFunds = await verifyFunds(bidAmount)
      
      if (!hasSufficientFunds) {
        return false
      }
      
      // Sign agreement that funds will be deducted if winning
      const signedAgreement = await smartContractService.signPaymentAgreement(walletAddress, auctionId)
      
      if (!signedAgreement) {
        toast.error("Failed to sign payment agreement")
        return false
      }
      
      // Place the bid in the smart contract
      const success = await smartContractService.placeBid(auctionId, walletAddress, bidAmount)
      
      if (success) {
        toast.success(`Bid of ${bidAmount.toFixed(2)} ETH placed successfully!`)
        setHasBid(true)
        setCurrentBid(bidAmount)
        return true
      } else {
        toast.error("Failed to place bid. Please try again.")
        return false
      }
    } catch (error) {
      console.error("Error placing bid:", error)
      toast.error("An error occurred while placing your bid")
      return false
    } finally {
      setIsBidding(false)
    }
  }
  
  return {
    isVerifyingFunds,
    isBidding,
    hasBid,
    currentBid,
    isLoadingAuction,
    verifyFunds,
    placeBid,
    loadAuctionData
  }
}
