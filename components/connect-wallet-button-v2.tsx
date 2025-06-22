"use client"

import { Wallet, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/contexts/wallet-context"

export function ConnectWalletButton() {
  const { isConnected, walletAddress, isLoading, connectWallet, disconnectWallet, error } = useWallet()

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
        </Button>
        <Button variant="ghost" size="sm" onClick={disconnectWallet}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" disabled={isLoading}>
          <Wallet className="h-4 w-4" />
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect your wallet</DialogTitle>
          <DialogDescription>Connect your Ethereum wallet to bid on auctions</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button onClick={connectWallet} className="w-full" disabled={isLoading}>
            {isLoading ? "Connecting..." : "Connect with MetaMask"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Don't have MetaMask?{" "}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Download here
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
