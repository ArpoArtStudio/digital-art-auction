"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertCircle, Upload, User, Palette, Globe, Instagram, Twitter, Facebook } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import Image from "next/image"

interface ArtistRegistrationData {
  name: string
  bio: string
  email: string
  location: string
  specialization: string
  experience: string
  website: string
  twitter: string
  instagram: string
  facebook: string
  portfolio: string
}

interface ArtistRegistrationFormProps {
  onRegistrationSuccess: (artistData: any) => void
  onSkip?: () => void
}

export function ArtistRegistrationForm({ onRegistrationSuccess, onSkip }: ArtistRegistrationFormProps) {
  const { isConnected, walletAddress, connectWallet } = useWallet()
  const [formData, setFormData] = useState<ArtistRegistrationData>({
    name: "",
    bio: "",
    email: "",
    location: "",
    specialization: "",
    experience: "",
    website: "",
    twitter: "",
    instagram: "",
    facebook: "",
    portfolio: "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Please select an image smaller than 5MB")
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
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
      // Simulate API call to register artist
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const artistData = {
        ...formData,
        walletAddress,
        avatarUrl: avatarPreview || "/placeholder.svg?height=200&width=200",
        id: Math.random().toString(36).substring(2, 11),
        status: "pending",
        artworks: 0,
        totalSales: "0.0",
        joinDate: new Date().toISOString().split('T')[0],
        registeredAt: new Date().toISOString(),
      }

      console.log("Artist registered:", artistData)
      
      // Store artist data in localStorage (in production, this would be stored in database)
      const existingArtists = JSON.parse(localStorage.getItem('registeredArtists') || '[]')
      existingArtists.push(artistData)
      localStorage.setItem('registeredArtists', JSON.stringify(existingArtists))
      
      // Mark this wallet as having completed artist registration
      localStorage.setItem(`artistRegistered_${walletAddress}`, 'true')

      setSubmitStatus("success")
      
      // Call success callback after a short delay
      setTimeout(() => {
        onRegistrationSuccess(artistData)
      }, 2000)

    } catch (error) {
      console.error("Error registering artist:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Artist Registration Required
          </CardTitle>
          <CardDescription>Connect your wallet to complete your artist profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <Palette className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Before submitting artwork, please complete your artist registration to create your profile on the platform.
            </p>
            <Button onClick={connectWallet} className="w-full">
              Connect Wallet to Register
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (submitStatus === "success") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Artist Registration Successful!
          </CardTitle>
          <CardDescription>Welcome to the Arpo Studio community</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your artist profile has been created and is under review. You can now submit artwork for auction.
              You'll be notified once your profile is approved.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Artist Registration
        </CardTitle>
        <CardDescription>
          Complete your artist profile to start submitting artwork to our auction platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to register artist profile. Please try again.</AlertDescription>
            </Alert>
          )}

          {/* Profile Picture */}
          <div className="space-y-2">
            <Label>Profile Picture (Optional)</Label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Profile preview"
                    width={80}
                    height={80}
                    className="object-cover rounded-full"
                  />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload">
                  <Button type="button" variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Artist Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your display name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="City, Country"
                />
              </div>

              <div>
                <Label htmlFor="specialization">Art Specialization</Label>
                <Select value={formData.specialization} onValueChange={(value) => handleInputChange("specialization", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital-art">Digital Art</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="3d-art">3D Art</SelectItem>
                    <SelectItem value="generative-art">Generative Art</SelectItem>
                    <SelectItem value="pixel-art">Pixel Art</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                    <SelectItem value="conceptual">Conceptual</SelectItem>
                    <SelectItem value="mixed-media">Mixed Media</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (5-10 years)</SelectItem>
                    <SelectItem value="expert">Expert (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={(e) => handleInputChange("twitter", e.target.value)}
                    placeholder="@yourusername"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange("instagram", e.target.value)}
                    placeholder="@yourusername"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bio - Full Width */}
          <div>
            <Label htmlFor="bio">Artist Bio *</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell us about yourself, your artistic journey, and what inspires your work..."
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Portfolio URL */}
          <div>
            <Label htmlFor="portfolio">Portfolio URL (Optional)</Label>
            <Input
              id="portfolio"
              value={formData.portfolio}
              onChange={(e) => handleInputChange("portfolio", e.target.value)}
              placeholder="Link to your existing portfolio or gallery"
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What happens next:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your artist profile will be reviewed by our team (usually within 24 hours)</li>
              <li>• Once approved, you can start submitting artwork for auction</li>
              <li>• Your profile will be visible to collectors on the platform</li>
              <li>• You'll be able to build your reputation and following</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Creating Profile..." : "Complete Registration"}
            </Button>
            {onSkip && (
              <Button type="button" variant="outline" onClick={onSkip}>
                Skip for Now
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
