"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, AlertCircle, CheckCircle, Info, Wallet, Image as ImageIcon } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { useFeatures } from "@/contexts/feature-context"
import { ArtistRegistrationForm } from "@/components/artist-registration-form"
import { NFTGallerySelector } from "@/components/nft-gallery-selector"
import Image from "next/image"

interface NFT {
  tokenId: string
  contractAddress: string
  name: string
  description: string
  image: string
  collection: string
}

export function ArtworkSubmissionForm() {
  const { isConnected, walletAddress, connectWallet, isAdmin } = useWallet()
  const { features } = useFeatures()
  
  // Form data for artwork upload section
  const [uploadFormData, setUploadFormData] = useState({
    title: "",
    description: "",
    category: "",
    startingPrice: "",
    duration: "1",
    royaltyPercentage: "5",
  })
  
  // NFT selection data
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  
  // Common states
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [isArtistRegistered, setIsArtistRegistered] = useState<boolean | null>(null)
  const [showRegistration, setShowRegistration] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  
  // Check if user can submit artwork based on curated mode setting
  const canSubmitArtwork = !features.enableCuratedMode || isAdmin

  // Check if user is already registered as an artist
  useEffect(() => {
    if (isConnected && walletAddress) {
      const isRegistered = localStorage.getItem(`artistRegistered_${walletAddress}`)
      setIsArtistRegistered(!!isRegistered)
      
      // If not registered, show registration form
      if (!isRegistered) {
        setShowRegistration(true)
      }
    }
  }, [isConnected, walletAddress])

  const handleArtistRegistrationSuccess = (artistData: any) => {
    setIsArtistRegistered(true)
    setShowRegistration(false)
  }

  const handleSkipRegistration = () => {
    setShowRegistration(false)
  }

  const handleUploadInputChange = (field: string, value: string) => {
    setUploadFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNFTSelect = (nft: NFT) => {
    setSelectedNFT(nft)
  }

  const handleSubmitArtworkUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      await connectWallet()
      return
    }

    if (!imageFile) {
      alert("Please upload an image")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate artwork upload and NFT creation
      await new Promise((resolve) => setTimeout(resolve, 3000))
      
      // Here you would:
      // 1. Upload image to IPFS
      // 2. Create NFT metadata
      // 3. Mint NFT on blockchain
      // 4. Submit to auction queue
      
      setSubmitStatus("success")
      
      // Reset form
      setUploadFormData({
        title: "",
        description: "",
        category: "",
        startingPrice: "",
        duration: "1",
        royaltyPercentage: "5",
      })
      setImageFile(null)
      setImagePreview("")
    } catch (error) {
      setSubmitStatus("error")
      console.error("Error submitting artwork:", error)
    }

    setIsSubmitting(false)
  }

  const handleSubmitNFT = async () => {
    if (!selectedNFT || !isConnected) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate NFT transfer to escrow
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      // Here you would:
      // 1. Transfer NFT to escrow wallet
      // 2. Add to auction queue
      // 3. Record submission in database
      
      setSubmitStatus("success")
      setSelectedNFT(null)
    } catch (error) {
      setSubmitStatus("error")
      console.error("Error submitting NFT:", error)
    }

    setIsSubmitting(false)
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>You need to connect your wallet to submit artwork</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectWallet} className="w-full">
            Connect Wallet
          </Button>
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
  
  // Show a message when curated mode is enabled and user is not an admin
  if (features.enableCuratedMode && !isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Curated Mode Enabled</CardTitle>
          <CardDescription>
            This platform is currently in curated mode. Only approved admin users can submit new artwork.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Submission Restricted</AlertTitle>
            <AlertDescription>
              Please contact the platform administrators if you would like to have your artwork featured.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {submitStatus === "success" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your artwork has been successfully submitted and added to the auction queue.
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error submitting your artwork. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Two ways to submit:</strong> Upload your artwork to create a new NFT, or select an existing NFT from your wallet to submit for auction.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Upload Artwork
          </TabsTrigger>
          <TabsTrigger value="existing" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Use Existing NFT
          </TabsTrigger>
        </TabsList>

        {/* Section 1: Upload Artwork (Create NFT) */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Artwork</CardTitle>
              <CardDescription>
                Upload your digital artwork and we'll create an NFT for you. Perfect for artists new to NFTs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitArtworkUpload} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="artwork-image">Artwork Image *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={300}
                          height={300}
                          className="mx-auto rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview("")
                          }}
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div>
                          <p className="text-lg font-medium">Click to upload your artwork</p>
                          <p className="text-sm text-gray-500">(Max 10MB, JPEG/PNG/GIF)</p>
                        </div>
                        <input
                          id="artwork-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("artwork-image")?.click()}
                        >
                          Select Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Artwork Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Artwork Title *</Label>
                    <Input
                      id="title"
                      value={uploadFormData.title}
                      onChange={(e) => handleUploadInputChange("title", e.target.value)}
                      placeholder="Enter artwork title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={uploadFormData.category} onValueChange={(value) => handleUploadInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital-art">Digital Art</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="3d-art">3D Art</SelectItem>
                        <SelectItem value="abstract">Abstract</SelectItem>
                        <SelectItem value="pixel-art">Pixel Art</SelectItem>
                        <SelectItem value="generative">Generative Art</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={uploadFormData.description}
                    onChange={(e) => handleUploadInputChange("description", e.target.value)}
                    placeholder="Describe your artwork, inspiration, and techniques used"
                    className="min-h-[100px]"
                    required
                  />
                </div>

                {/* Auction Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="starting-price">Starting Price (ETH) *</Label>
                    <Input
                      id="starting-price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={uploadFormData.startingPrice}
                      onChange={(e) => handleUploadInputChange("startingPrice", e.target.value)}
                      placeholder="0.1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Auction Duration</Label>
                    <Select value={uploadFormData.duration} onValueChange={(value) => handleUploadInputChange("duration", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day (Recommended)</SelectItem>
                        <SelectItem value="2">2 days</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="royalty">Royalty % (Future Sales)</Label>
                    <Select value={uploadFormData.royaltyPercentage} onValueChange={(value) => handleUploadInputChange("royaltyPercentage", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="2.5">2.5%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="7.5">7.5%</SelectItem>
                        <SelectItem value="10">10%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Process Information */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Minting Process</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your artwork will be uploaded to IPFS for permanent storage</li>
                    <li>• A unique NFT will be minted on the blockchain</li>
                    <li>• The NFT will be automatically transferred to our escrow</li>
                    <li>• Your artwork will be added to the auction queue</li>
                    <li>• Minting fee: ~$5-20 in gas fees (paid to blockchain)</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || !imageFile}
                >
                  {isSubmitting ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Creating NFT & Submitting...
                    </>
                  ) : (
                    "Create NFT & Submit for Auction"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section 2: Select Existing NFT */}
        <TabsContent value="existing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Your NFT</CardTitle>
              <CardDescription>
                Choose an NFT from your wallet to submit for auction. The NFT will be transferred to our escrow wallet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NFTGallerySelector onNFTSelect={handleNFTSelect} selectedNFT={selectedNFT} />
              
              {selectedNFT && (
                <div className="space-y-6 mt-6">
                  {/* Selected NFT Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Ready to Submit</CardTitle>
                      <CardDescription>
                        Your selected NFT will be transferred to escrow and added to the auction queue
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 mb-4">
                        <Image
                          src={selectedNFT.image || "/placeholder.svg"}
                          alt={selectedNFT.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold">{selectedNFT.name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedNFT.collection}</p>
                          <p className="text-xs text-muted-foreground">Token ID: {selectedNFT.tokenId}</p>
                        </div>
                      </div>

                      {/* Warning Box */}
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold mb-2 text-yellow-800">⚠️ Important Information</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Your NFT will be transferred to our secure escrow wallet</li>
                          <li>• Our team will review your submission (usually within 24 hours)</li>
                          <li>• Once approved, your artwork will be added to the auction queue</li>
                          <li>• You'll receive 90% of the final sale price</li>
                          <li>• Cancellation after submission requires a 0.1 ETH penalty</li>
                        </ul>
                      </div>

                      <Button
                        onClick={handleSubmitNFT}
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Wallet className="mr-2 h-4 w-4 animate-spin" />
                            Transferring to Escrow...
                          </>
                        ) : (
                          "Submit NFT to Auction Queue"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
