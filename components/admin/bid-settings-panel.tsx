"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { useBiddingContext } from "@/contexts/bidding-context"

export function BidSettingsPanel() {
  const { 
    minBidIncrementPercentage, 
    setMinBidIncrementPercentage,
    maxBidIncrementPercentage,
    currentBid,
    getNextMinimumBid,
    getMaximumBid
  } = useBiddingContext()
  
  const [incrementPercentage, setIncrementPercentage] = useState(minBidIncrementPercentage * 100)
  
  // Update the minimum bid increment percentage
  const handleSaveSettings = () => {
    const newPercentage = incrementPercentage / 100
    setMinBidIncrementPercentage(newPercentage)
    toast.success(`Minimum bid increment set to ${incrementPercentage}%`)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auction Bid Settings</CardTitle>
        <CardDescription>Configure bidding parameters for the auction</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="minBidIncrement">Minimum Bid Increment (%)</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="minBidIncrement"
                min={1}
                max={10}
                step={0.5}
                defaultValue={[incrementPercentage]}
                onValueChange={(values) => setIncrementPercentage(values[0])}
                className="w-full"
              />
              <span className="w-12 text-center">{incrementPercentage}%</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Maximum Bid Increment</p>
            <p className="text-sm text-muted-foreground">Fixed at {maxBidIncrementPercentage * 100}%</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Current Bid</p>
            <div className="flex items-center justify-between">
              <span>{currentBid.toFixed(2)} ETH</span>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Min Next Bid: {getNextMinimumBid().toFixed(2)} ETH</p>
                <p className="text-sm text-muted-foreground">Max Next Bid: {getMaximumBid().toFixed(2)} ETH</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Bid Rules Preview</p>
            <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
              <p>Min Bid = Current Bid × {incrementPercentage}%</p>
              <p>Max Bid = Current Bid × {maxBidIncrementPercentage * 100}%</p>
              <p>Next Min Bid = Current Bid + Min Increment</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings}>Save Settings</Button>
      </CardFooter>
    </Card>
  )
}
