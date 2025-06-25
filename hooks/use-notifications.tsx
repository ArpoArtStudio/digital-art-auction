"use client"

import { useState } from 'react'
import { useFeatures } from '@/contexts/feature-context'
import { useWallet } from '@/contexts/wallet-context'
import { emailService } from '@/lib/email-service'
import { toast } from 'sonner'

export function useNotifications() {
  const { features } = useFeatures()
  const { walletAddress } = useWallet()
  const [email, setEmail] = useState<string>('')
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Check if the wallet is subscribed when wallet changes
  useState(() => {
    if (walletAddress) {
      const subscribed = emailService.isSubscribed(walletAddress)
      setIsSubscribed(subscribed)
      
      if (subscribed) {
        const subscription = emailService.getSubscription(walletAddress)
        if (subscription) {
          setEmail(subscription.email)
        }
      }
    } else {
      setIsSubscribed(false)
      setEmail('')
    }
  }, [walletAddress])
  
  // Subscribe to email notifications
  const subscribe = async (emailAddress: string) => {
    if (!features.enableEmailNotifications) {
      toast.error("Email notifications are not enabled")
      return false
    }
    
    if (!walletAddress) {
      toast.error("Please connect your wallet")
      return false
    }
    
    setIsLoading(true)
    try {
      const success = await emailService.subscribeEmail(emailAddress, walletAddress)
      
      if (success) {
        setIsSubscribed(true)
        setEmail(emailAddress)
        toast.success("Successfully subscribed to notifications")
      } else {
        toast.error("Failed to subscribe to notifications")
      }
      
      return success
    } catch (error) {
      console.error("Error subscribing to notifications:", error)
      toast.error("An error occurred while subscribing")
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // Unsubscribe from email notifications
  const unsubscribe = async () => {
    if (!features.enableEmailNotifications) {
      return false
    }
    
    if (!walletAddress) {
      toast.error("Please connect your wallet")
      return false
    }
    
    setIsLoading(true)
    try {
      const success = await emailService.unsubscribeEmail(walletAddress)
      
      if (success) {
        setIsSubscribed(false)
        setEmail('')
        toast.success("Successfully unsubscribed from notifications")
      } else {
        toast.error("Failed to unsubscribe from notifications")
      }
      
      return success
    } catch (error) {
      console.error("Error unsubscribing from notifications:", error)
      toast.error("An error occurred while unsubscribing")
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // Send a notification about a bid
  const notifyBid = async (auctionId: string, artworkTitle: string, bidAmount: number) => {
    if (!features.enableEmailNotifications || !walletAddress) {
      return false
    }
    
    try {
      return await emailService.sendBidNotification(auctionId, artworkTitle, bidAmount, walletAddress)
    } catch (error) {
      console.error("Error sending bid notification:", error)
      return false
    }
  }
  
  return {
    email,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    notifyBid,
  }
}
