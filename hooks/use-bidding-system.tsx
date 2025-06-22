"use client"

import { useState, useEffect } from 'react'
import { useChatContext } from '@/contexts/chat-context'
import { useBiddingContext, BiddingLevel } from '@/contexts/bidding-context'
import { toast } from 'sonner'

/**
 * Custom hook to handle bidding actions and update user levels
 * This connects the auction system with the chat gamification system
 */
export function useBiddingSystem() {
  const { incrementBidCount, userLevel, userBidCount, getLevelName, getLevelFromBidCount } = useBiddingContext()
  const { notifyBidPlaced } = useChatContext()
  const [previousLevel, setPreviousLevel] = useState<BiddingLevel | null>(null)
  
  // Track level changes to show notifications
  useEffect(() => {
    if (previousLevel !== null && previousLevel !== userLevel) {
      // User has leveled up
      toast.success(`You leveled up to ${getLevelName(userLevel)}! (Level ${userLevel})`, {
        duration: 5000,
      })
    }
    
    // Store current level for future comparison
    setPreviousLevel(userLevel)
  }, [userLevel, previousLevel, getLevelName])
  
  /**
   * Call this function whenever a user places a bid on an artwork
   * It will increment their bid count and update their chat level
   */
  const placeBid = () => {
    // Check if this bid will cause a level up
    const nextBidCount = userBidCount + 1
    const currentLevel = userLevel
    const nextLevel = getLevelFromBidCount(nextBidCount)
    
    // Increment bid count in the bidding context
    incrementBidCount()
    
    // Notify the chat system about the new bid
    notifyBidPlaced()
    
    return {
      newBidCount: nextBidCount,
      newLevel: nextLevel,
      leveledUp: nextLevel > currentLevel
    }
  }
  
  return {
    placeBid,
    userLevel,
    userBidCount
  }
}
