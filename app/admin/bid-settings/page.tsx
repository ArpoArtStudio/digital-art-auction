"use client"

import React from "react"
import { BidSettingsPanel } from "@/components/admin/bid-settings-panel"
import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BidSettingsPage() {
  const { isConnected, isAdmin } = useWallet()
  
  if (!isConnected) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Auction Bid Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please connect your wallet to access admin settings.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (!isAdmin) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Auction Bid Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to access these settings. Admin access required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Auction Bid Settings</h1>
      <BidSettingsPanel />
    </div>
  )
}
