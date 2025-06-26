"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertCircle, Upload, User, Edit3, Save, X, Globe, Instagram, Twitter, Facebook } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { getArtistProfile, updateArtistProfile, ArtistProfile, getArtistSubmissions, getArtistBadge } from "@/lib/artist-utils"
import { ArtistBadge } from "@/components/artist-badge"
import Image from "next/image"

interface MyProfileProps {
  onClose?: () => void
}

export function MyProfile({ onClose }: MyProfileProps) {
  const { walletAddress } = useWallet()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    email: "",
    location: "",
    website: "",
    twitter: "",
    instagram: "",
    facebook: "",
    portfolio: "",
  })

  useEffect(() => {
    if (walletAddress) {
      const profile = getArtistProfile(walletAddress)
      if (profile) {
        setArtistProfile(profile)
        setFormData({
          name: profile.name,
          bio: profile.bio,
          email: profile.email,
          location: profile.location,
          website: profile.website,
          twitter: profile.twitter,
          instagram: profile.instagram,
          facebook: profile.facebook,
          portfolio: profile.portfolio,
        })
        setAvatarPreview(profile.avatarUrl)
      }
    }
  }, [walletAddress])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

  const handleSave = async () => {
    if (!walletAddress || !artistProfile) return

    setSaving(true)
    setSaveStatus("idle")

    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const updatedData = {
        ...formData,
        avatarUrl: avatarPreview
      }

      const success = updateArtistProfile(walletAddress, updatedData)
      
      if (success) {
        // Update local state
        setArtistProfile(prev => prev ? { ...prev, ...updatedData } : null)
        setSaveStatus("success")
        setIsEditing(false)
        
        // Clear success message after 3 seconds
        setTimeout(() => setSaveStatus("idle"), 3000)
      } else {
        setSaveStatus("error")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      setSaveStatus("error")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (artistProfile) {
      setFormData({
        name: artistProfile.name,
        bio: artistProfile.bio,
        email: artistProfile.email,
        location: artistProfile.location,
        website: artistProfile.website,
        twitter: artistProfile.twitter,
        instagram: artistProfile.instagram,
        facebook: artistProfile.facebook,
        portfolio: artistProfile.portfolio,
      })
      setAvatarPreview(artistProfile.avatarUrl)
      setAvatarFile(null)
    }
    setIsEditing(false)
    setSaveStatus("idle")
  }

  if (!artistProfile) {
    return null
  }

  // Get artist badge
  const submissions = getArtistSubmissions(walletAddress || "")
  const badge = getArtistBadge(submissions.length)

  return (
    <Card className="w-full">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="flex items-center gap-2">
                My Profile
                {badge && <ArtistBadge badge={badge} size="sm" />}
              </CardTitle>
              <CardDescription>
                Manage your artist profile and public information
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
            {onClose && (
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {saveStatus === "success" && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your profile has been updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {saveStatus === "error" && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to update profile. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-border overflow-hidden">
              <Image
                src={avatarPreview || "/placeholder.svg"}
                alt="Profile picture"
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Profile Picture</h3>
              {isEditing ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload">
                    <Button type="button" variant="outline" size="sm" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Change Photo
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click "Edit Profile" to change your profile picture
                </p>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Artist Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              disabled={!isEditing}
              className={!isEditing ? "bg-muted" : ""}
              placeholder="City, Country"
            />
          </div>

          <div>
            <Label htmlFor="bio">Artist Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              disabled={!isEditing}
              className={!isEditing ? "bg-muted" : ""}
              rows={4}
              placeholder="Tell us about yourself and your artistic journey..."
            />
            {isEditing && (
              <p className="text-xs text-muted-foreground mt-1">
                {formData.bio.length}/500 characters
              </p>
            )}
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Social Links & Portfolio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    disabled={!isEditing}
                    className={cn("pl-10", !isEditing ? "bg-muted" : "")}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="portfolio">Portfolio</Label>
                <Input
                  id="portfolio"
                  value={formData.portfolio}
                  onChange={(e) => handleInputChange("portfolio", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  placeholder="Link to your portfolio"
                />
              </div>

              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={(e) => handleInputChange("twitter", e.target.value)}
                    disabled={!isEditing}
                    className={cn("pl-10", !isEditing ? "bg-muted" : "")}
                    placeholder="@yourusername"
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
                    disabled={!isEditing}
                    className={cn("pl-10", !isEditing ? "bg-muted" : "")}
                    placeholder="@yourusername"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Artist Stats */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Artist Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{submissions.length}</div>
                <div className="text-sm text-muted-foreground">Total Submissions</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-500">
                  {submissions.filter(s => s.status === "approved").length}
                </div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-500">
                  {submissions.filter(s => s.status === "live").length}
                </div>
                <div className="text-sm text-muted-foreground">Live Auctions</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-500">
                  {submissions.filter(s => s.status === "sold").length}
                </div>
                <div className="text-sm text-muted-foreground">Sold</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Add missing import
import { cn } from "@/lib/utils"
