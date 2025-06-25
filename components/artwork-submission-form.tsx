"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, AlertCircle, CheckCircle, Info } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { useFeatures } from "@/contexts/feature-context"
import Image from "next/image"

export function ArtworkSubmissionForm() {
  const { isConnected, walletAddress, connectWallet, isAdmin } = useWallet()
  const { features } = useFeatures()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startingPrice: "",
    duration: "7",
    nftContract: "",
    tokenId: "",
    imageUrl: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  
  // Check if user can submit artwork based on curated mode setting
  const canSubmitArtwork = !features.enableCuratedMode || isAdmin

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      await connectWallet()
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Simulate NFT transfer to escrow
      console.log("Transferring NFT to escrow wallet...")
      console.log("Escrow wallet: 0xEscrow123...456")

      // Simulate API call to submit artwork
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock submission data
      const submissionData = {
        ...formData,
        artistWallet: walletAddress,
        imageFile: imageFile ? "uploaded-file.jpg" : formData.imageUrl,
        submittedAt: new Date().toISOString(),
        status: "pending",
        queuePosition: Math.floor(Math.random() * 10) + 1,
      }

      console.log("Artwork submitted:", submissionData)
      setSubmitStatus("success")

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        startingPrice: "",
        duration: "7",
        nftContract: "",
        tokenId: "",
        imageUrl: "",
      })
      setImageFile(null)
      setImagePreview("")
    } catch (error) {
      console.error("Error submitting artwork:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
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
    <Card>
      <CardHeader>
        <CardTitle>Submit Artwork for Auction</CardTitle>
        <CardDescription>
          Fill out the details below to submit your NFT for auction. Your NFT will be transferred to our escrow wallet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitStatus === "success" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your artwork has been successfully submitted and added to the auction queue!
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to submit artwork. Please try again.</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Artwork Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter artwork title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your artwork"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital-art">Digital Art</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="3d-models">3D Models</SelectItem>
                    <SelectItem value="animation">Animation</SelectItem>
                    <SelectItem value="generative">Generative Art</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startingPrice">Starting Price (ETH)</Label>
                <Input
                  id="startingPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.startingPrice}
                  onChange={(e) => handleInputChange("startingPrice", e.target.value)}
                  placeholder="0.1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="duration">Auction Duration (days)</Label>
                <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
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
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nftContract">NFT Contract Address</Label>
                <Input
                  id="nftContract"
                  value={formData.nftContract}
                  onChange={(e) => handleInputChange("nftContract", e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="tokenId">Token ID</Label>
                <Input
                  id="tokenId"
                  value={formData.tokenId}
                  onChange={(e) => handleInputChange("tokenId", e.target.value)}
                  placeholder="123"
                  required
                />
              </div>

              <div>
                <Label>Artwork Image</Label>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload image or drag and drop</p>
                    </label>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">or</div>

                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {(imagePreview || formData.imageUrl) && (
                    <div className="relative aspect-square w-full max-w-xs mx-auto">
                      <Image
                        src={imagePreview || formData.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Important Information</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • Your NFT will be transferred to our escrow wallet:{" "}
                <code className="bg-background px-1 rounded">0xEscrow123...456</code>
              </li>
              <li>• 90% of the sale proceeds will go to you, 10% to the platform</li>
              <li>• Cancellation after submission requires a 0.1 ETH penalty</li>
              <li>• Your artwork will be reviewed before being added to the auction queue</li>
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Artwork"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
