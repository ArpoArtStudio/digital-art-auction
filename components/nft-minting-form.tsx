"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import Image from "next/image"

interface MintingFormData {
  title: string
  description: string
  category: string
  startingPrice: string
  duration: string
  royaltyPercentage: string
}

interface NFTMintingFormProps {
  onMintSuccess: (nft: any) => void
}

export function NFTMintingForm({ onMintSuccess }: NFTMintingFormProps) {
  const { isConnected, walletAddress, connectWallet } = useWallet()
  const [formData, setFormData] = useState<MintingFormData>({
    title: "",
    description: "",
    category: "",
    startingPrice: "",
    duration: "7",
    royaltyPercentage: "5",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isMinting, setIsMinting] = useState(false)
  const [mintStatus, setMintStatus] = useState<"idle" | "uploading" | "minting" | "success" | "error">("idle")
  const [mintedNFT, setMintedNFT] = useState<any>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      await connectWallet()
      return
    }

    if (!imageFile) {
      alert("Please select an image to mint")
      return
    }

    setIsMinting(true)
    setMintStatus("uploading")

    try {
      // Step 1: Upload image to IPFS (simulated)
      console.log("Uploading image to IPFS...")
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const ipfsImageUrl = `ipfs://QmExample123.../${imageFile.name}`

      // Step 2: Upload metadata to IPFS (simulated)
      setMintStatus("minting")
      console.log("Uploading metadata to IPFS...")
      const metadata = {
        name: formData.title,
        description: formData.description,
        image: ipfsImageUrl,
        attributes: [
          { trait_type: "Category", value: formData.category },
          { trait_type: "Artist", value: walletAddress },
        ],
      }
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const ipfsMetadataUrl = `ipfs://QmMetadata456.../${formData.title}.json`

      // Step 3: Mint NFT (simulated smart contract call)
      console.log("Minting NFT...")
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newNFT = {
        tokenId: Math.floor(Math.random() * 10000).toString(),
        contractAddress: "0xArtBaseNFT123456789abcdef", // Your NFT contract
        name: formData.title,
        description: formData.description,
        image: imagePreview, // Use preview for demo
        collection: "ArtBase Originals",
        metadata: metadata,
        ipfsUrl: ipfsMetadataUrl,
        mintedBy: walletAddress,
        mintedAt: new Date().toISOString(),
      }

      setMintedNFT(newNFT)
      setMintStatus("success")
      onMintSuccess(newNFT)

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        startingPrice: "",
        duration: "7",
        royaltyPercentage: "5",
      })
      setImageFile(null)
      setImagePreview("")
    } catch (error) {
      console.error("Error minting NFT:", error)
      setMintStatus("error")
    } finally {
      setIsMinting(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>You need to connect your wallet to mint NFTs</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectWallet} className="w-full">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (mintStatus === "success" && mintedNFT) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            NFT Minted Successfully!
          </CardTitle>
          <CardDescription>Your NFT has been minted and is ready for auction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Image
              src={mintedNFT.image || "/placeholder.svg"}
              alt={mintedNFT.name}
              width={100}
              height={100}
              className="rounded-lg"
            />
            <div>
              <h3 className="font-semibold">{mintedNFT.name}</h3>
              <p className="text-sm text-muted-foreground">Token ID: {mintedNFT.tokenId}</p>
              <p className="text-xs text-muted-foreground">Contract: {mintedNFT.contractAddress}</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setMintStatus("idle")
              setMintedNFT(null)
            }}
            className="w-full"
          >
            Mint Another NFT
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mint Your NFT</CardTitle>
        <CardDescription>Create a new NFT from your artwork and submit it for auction</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleMint} className="space-y-6">
          {mintStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to mint NFT. Please try again.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label>Artwork Image *</Label>
              <div className="mt-2">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={isMinting}
                  />
                  <label htmlFor="image-upload" className={`cursor-pointer ${isMinting ? "opacity-50" : ""}`}>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload your artwork (Max 10MB, JPG/PNG/GIF)
                    </p>
                  </label>
                </div>

                {imagePreview && (
                  <div className="mt-4 relative aspect-square w-full max-w-xs mx-auto">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Artwork Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter artwork title"
                  required
                  disabled={isMinting}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                  disabled={isMinting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital-art">Digital Art</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="3d-models">3D Models</SelectItem>
                    <SelectItem value="animation">Animation</SelectItem>
                    <SelectItem value="generative">Generative Art</SelectItem>
                    <SelectItem value="pixel-art">Pixel Art</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your artwork, inspiration, and techniques used"
                rows={4}
                required
                disabled={isMinting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startingPrice">Starting Price (ETH) *</Label>
                <Input
                  id="startingPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.startingPrice}
                  onChange={(e) => handleInputChange("startingPrice", e.target.value)}
                  placeholder="0.1"
                  required
                  disabled={isMinting}
                />
              </div>

              <div>
                <Label htmlFor="duration">Auction Duration</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => handleInputChange("duration", value)}
                  disabled={isMinting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="royalty">Royalty % (Future Sales)</Label>
                <Select
                  value={formData.royaltyPercentage}
                  onValueChange={(value) => handleInputChange("royaltyPercentage", value)}
                  disabled={isMinting}
                >
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
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Minting Process</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your artwork will be uploaded to IPFS for permanent storage</li>
              <li>• A unique NFT will be minted on the blockchain</li>
              <li>• The NFT will be automatically transferred to our escrow</li>
              <li>• Your artwork will be added to the auction queue</li>
              <li>• Minting fee: ~$5-20 in gas fees (paid to blockchain)</li>
            </ul>
          </div>

          {isMinting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    {mintStatus === "uploading" && "Uploading to IPFS..."}
                    {mintStatus === "minting" && "Minting your NFT..."}
                  </p>
                  <p className="text-sm text-blue-700">This may take a few minutes. Please don't close this page.</p>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isMinting || !imageFile}>
            {isMinting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mintStatus === "uploading" && "Uploading..."}
                {mintStatus === "minting" && "Minting..."}
              </>
            ) : (
              "Mint NFT & Submit for Auction"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
