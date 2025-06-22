"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Info } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { NFTGallerySelector } from "@/components/nft-gallery-selector"
import { NFTMintingForm } from "@/components/nft-minting-form"

interface NFT {
  tokenId: string
  contractAddress: string
  name: string
  description: string
  image: string
  collection: string
}

export function EnhancedArtworkSubmissionForm() {
  const { isConnected, connectWallet } = useWallet()
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleNFTSelect = (nft: NFT) => {
    setSelectedNFT(nft)
  }

  const handleMintSuccess = (nft: any) => {
    // Automatically select the newly minted NFT
    setSelectedNFT({
      tokenId: nft.tokenId,
      contractAddress: nft.contractAddress,
      name: nft.name,
      description: nft.description,
      image: nft.image,
      collection: nft.collection,
    })
  }

  const handleSubmitToQueue = async () => {
    if (!selectedNFT) return

    try {
      console.log("Submitting NFT to auction queue:", selectedNFT)
      console.log("Transferring to escrow wallet: 0xEscrow123...456")

      // Simulate submission
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setSubmitStatus("success")
    } catch (error) {
      console.error("Error submitting to queue:", error)
      setSubmitStatus("error")
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>Connect your wallet to submit artwork for auction</CardDescription>
        </CardHeader>
        <CardContent>
          <button onClick={connectWallet} className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md">
            Connect Wallet
          </button>
        </CardContent>
      </Card>
    )
  }

  if (submitStatus === "success") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Artwork Submitted Successfully!
          </CardTitle>
          <CardDescription>Your NFT has been added to the auction queue</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your artwork is now in the review queue. You'll be notified once it's approved and scheduled for auction.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Two ways to submit:</strong> Mint a new NFT from your artwork, or select an existing NFT from your
          wallet.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="mint" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mint">Mint New NFT</TabsTrigger>
          <TabsTrigger value="existing">Use Existing NFT</TabsTrigger>
        </TabsList>

        <TabsContent value="mint" className="space-y-6">
          <NFTMintingForm onMintSuccess={handleMintSuccess} />
        </TabsContent>

        <TabsContent value="existing" className="space-y-6">
          <NFTGallerySelector onNFTSelect={handleNFTSelect} selectedNFT={selectedNFT} />
        </TabsContent>
      </Tabs>

      {selectedNFT && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Submit</CardTitle>
            <CardDescription>
              Your selected NFT will be transferred to escrow and added to the auction queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={selectedNFT.image || "/placeholder.svg"}
                alt={selectedNFT.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold">{selectedNFT.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedNFT.collection}</p>
                <p className="text-xs text-muted-foreground">Token ID: {selectedNFT.tokenId}</p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">What happens next:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your NFT will be transferred to our secure escrow wallet</li>
                <li>• Our team will review your submission (usually within 24 hours)</li>
                <li>• Once approved, your artwork will be added to the auction queue</li>
                <li>• You'll receive 90% of the final sale price</li>
                <li>• Cancellation after submission requires a 0.1 ETH penalty</li>
              </ul>
            </div>

            <button
              onClick={handleSubmitToQueue}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90"
            >
              Submit to Auction Queue
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
