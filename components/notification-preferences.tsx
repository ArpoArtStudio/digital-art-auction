"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useNotifications } from "@/hooks/use-notifications"
import { useWallet } from "@/contexts/wallet-context"
import { useFeatures } from "@/contexts/feature-context"
import { Bell, Mail, X } from "lucide-react"
import { toast } from "sonner"
import { emailService } from "@/lib/email-service"

export function NotificationPreferences() {
  const { features } = useFeatures()
  const { isConnected, connectWallet, walletAddress } = useWallet()
  const { email, isSubscribed, isLoading, subscribe, unsubscribe } = useNotifications()
  
  const [emailInput, setEmailInput] = useState("")
  const [preferences, setPreferences] = useState({
    newBids: true,
    auctionStart: true,
    auctionEnd: true,
    outbid: true,
    winningBid: true
  })
  
  // Feature flag check - don't render if email notifications not enabled
  if (!features.enableEmailNotifications) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailInput.trim()) {
      toast.error("Please enter your email address")
      return
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailInput)) {
      toast.error("Please enter a valid email address")
      return
    }
    
    await subscribe(emailInput)
  }
  
  const handleUpdate = async () => {
    if (!walletAddress) return
    
    try {
      const success = await emailService.updatePreferences(walletAddress, preferences)
      
      if (success) {
        toast.success("Notification preferences updated")
      } else {
        toast.error("Failed to update preferences")
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast.error("An error occurred")
    }
  }
  
  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Connect your wallet to manage email notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectWallet}>Connect Wallet</Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Manage your email notification preferences for auctions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex space-x-2">
                <Input
                  id="email"
                  placeholder="Enter your email address"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={unsubscribe}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-1" />
                Unsubscribe
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Notification Settings</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="newBids" className="flex-1">New bids on watched auctions</Label>
                  <Switch
                    id="newBids"
                    checked={preferences.newBids}
                    onCheckedChange={(checked) => setPreferences({...preferences, newBids: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auctionStart" className="flex-1">Auction start notifications</Label>
                  <Switch
                    id="auctionStart"
                    checked={preferences.auctionStart}
                    onCheckedChange={(checked) => setPreferences({...preferences, auctionStart: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auctionEnd" className="flex-1">Auction end notifications</Label>
                  <Switch
                    id="auctionEnd"
                    checked={preferences.auctionEnd}
                    onCheckedChange={(checked) => setPreferences({...preferences, auctionEnd: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="outbid" className="flex-1">When you are outbid</Label>
                  <Switch
                    id="outbid"
                    checked={preferences.outbid}
                    onCheckedChange={(checked) => setPreferences({...preferences, outbid: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="winningBid" className="flex-1">When you win an auction</Label>
                  <Switch
                    id="winningBid"
                    checked={preferences.winningBid}
                    onCheckedChange={(checked) => setPreferences({...preferences, winningBid: checked})}
                  />
                </div>
              </div>
              
              <Button onClick={handleUpdate} className="w-full mt-4">
                Update Preferences
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
