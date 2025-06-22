"use client"

import { useState } from "react"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Add this interface at the top of the file after imports
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
    }
  }
}

export function ConnectWalletButton() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const connectWallet = async () => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      alert("Wallet connection is only available in the browser")
      return
    }

    try {
      // Check if ethereum object exists
      if (typeof window.ethereum !== "undefined") {
        // Check if MetaMask is installed
        if (window.ethereum.isMetaMask) {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          })
          setWalletAddress(accounts[0])
          setIsConnected(true)
        } else {
          // Ethereum provider exists but it's not MetaMask
          alert("Please install MetaMask or use a MetaMask-compatible browser")
        }
      } else {
        // No ethereum provider found
        alert("No Ethereum wallet detected. Please install MetaMask or another Ethereum wallet.")
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      if (error.code === 4001) {
        // User rejected the request
        alert("Wallet connection was rejected by user")
      } else {
        alert("Failed to connect wallet. Please try again.")
      }
    }
  }

  return (
    <>
      {isConnected ? (
        <Button variant="outline" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
        </Button>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect your wallet</DialogTitle>
              <DialogDescription>Connect your Ethereum wallet to bid on auctions</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button onClick={connectWallet} className="w-full">
                Connect with MetaMask
              </Button>
              <Button variant="outline" className="w-full">
                Connect with WalletConnect
              </Button>
              <Button variant="outline" className="w-full">
                Connect with Coinbase Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
