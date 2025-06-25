"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Info } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { NFTGallerySelector } from "@/components/nft-gallery-selector"
import { NFTMintingForm } from "@/components/nft-minting-form"
import { ArtistRegistrationForm } from "@/components/artist-registration-form"
import { ArtistDashboard } from "@/components/artist-dashboard"
import { isArtistRegistered as checkArtistRegistered, isFirstTimeSubmission, addArtworkSubmission } from "@/lib/artist-utils"

interface NFT {
  tokenId: string
  contractAddress: string
  name: string
  description: string
  image: string
  collection: string
}

export function EnhancedArtworkSubmissionForm() {
  const { isConnected, connectWallet, walletAddress } = useWallet()
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [artistRegistered, setArtistRegistered] = useState<boolean | null>(null)
  const [showRegistration, setShowRegistration] = useState(false)
  const [showNewSubmission, setShowNewSubmission] = useState(false)

  // Check if user is already registered as an artist
  useEffect(() => {
    if (isConnected && walletAddress) {
      const isRegistered = checkArtistRegistered(walletAddress)
      setArtistRegistered(isRegistered)
      
      // If not registered, show registration form
      if (!isRegistered) {
        setShowRegistration(true)
      } else {
        // If registered but first time submission, show submission form directly
        const isFirstTime = isFirstTimeSubmission(walletAddress)
        if (isFirstTime) {
          setShowNewSubmission(true)
        }
      }
    }
  }, [isConnected, walletAddress])

  const handleArtistRegistrationSuccess = (artistData: any) => {
    setArtistRegistered(true)
    setShowRegistration(false)
    setShowNewSubmission(true) // Show submission form after registration
  }

  const handleSkipRegistration = () => {
    setShowRegistration(false)
    setShowNewSubmission(true)
  }

  const handleNewSubmission = () => {
    setShowNewSubmission(true)
    setSubmitStatus("idle")
    setSelectedNFT(null)
  }

  const handleBackToDashboard = () => {
    setShowNewSubmission(false)
    setSubmitStatus("idle")
    setSelectedNFT(null)
  }

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
    if (!selectedNFT || !walletAddress) return

    try {
      console.log("Submitting NFT to auction queue:", selectedNFT)
      console.log("Transferring to escrow wallet: 0xEscrow123...456")

      // Simulate submission
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create artwork submission record
      const submission = {
        id: Math.random().toString(36).substring(2, 11),
        title: selectedNFT.name,
        description: selectedNFT.description,
        category: "digital-art",
        startingPrice: "0.1", // Default starting price
        artistWallet: walletAddress,
        imageUrl: selectedNFT.image,
        status: "pending" as const,
        submittedAt: new Date().toISOString(),
        queuePosition: Math.floor(Math.random() * 10) + 1,
      }

      // Add to submissions
      addArtworkSubmission(submission)

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

  // Show artist registration form for first-time users
  if (isConnected && showRegistration) {
    return (
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Welcome to Arpo Studio!</strong> Since this is your first time submitting artwork, 
            please complete your artist registration to create your profile on the platform.
          </AlertDescription>
        </Alert>
        <ArtistRegistrationForm 
          onRegistrationSuccess={handleArtistRegistrationSuccess}
          onSkip={handleSkipRegistration}
        />
      </div>
    )
  }

  if (submitStatus === "success") {
    return (
      <div className="space-y-6">
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
            <div className="mt-4">
              <button 
                onClick={handleBackToDashboard}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90"
              >
                Back to Dashboard
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show artist dashboard for existing artists (unless they're making a new submission)
  if (isConnected && artistRegistered && !showNewSubmission) {
    return <ArtistDashboard onNewSubmission={handleNewSubmission} />
  }

  // Show new submission form for registered artists or after registration
  if (isConnected && (showNewSubmission || (artistRegistered && !showRegistration))) {
    return (
      <div className="space-y-6">
        {artistRegistered && (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Submit New Artwork</h2>
            <button 
              onClick={handleBackToDashboard}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Dashboard
            </button>
          </div>
        )}
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

  // Show artist registration form for first-time users
  if (isConnected && showRegistration) {
    return (
      <ArtistRegistrationForm 
        onRegistrationSuccess={handleArtistRegistrationSuccess}
        onSkip={handleSkipRegistration}
      />
    )
  }

  // Show wallet connection prompt
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Artwork</CardTitle>
        <CardDescription>
          Connect your wallet to submit artwork for auction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <button
          onClick={connectWallet}
          className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90"
        >
          Connect Wallet
        </button>
      </CardContent>
    </Card>
  )
}
