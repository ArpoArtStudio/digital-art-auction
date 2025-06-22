"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Download, ExternalLink } from "lucide-react"

export function WalletFallback() {
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    // Check if we're in browser and no wallet is available
    if (typeof window !== "undefined" && !window.ethereum) {
      setShowFallback(true)
    }
  }, [])

  if (!showFallback) {
    return null
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <CardTitle>Wallet Required</CardTitle>
        <CardDescription>To participate in auctions and place bids, you'll need an Ethereum wallet.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild className="w-full">
          <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-2" />
            Install MetaMask
          </a>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <a href="https://wallet.coinbase.com/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Get Coinbase Wallet
          </a>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          After installing a wallet, refresh this page to connect.
        </p>
      </CardContent>
    </Card>
  )
}
