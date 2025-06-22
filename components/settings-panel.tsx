"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Wallet, Globe, DollarSign, Bell, Shield } from "lucide-react"

export function SettingsPanel() {
  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "ArtBase",
    description: "Digital Art Auctions on Base Chain",
    contactEmail: "support@artbase.com",
    featuredArtistsLimit: "4",
  })

  // Fee settings state
  const [feeSettings, setFeeSettings] = useState({
    platformFeePercentage: "10",
    artistRoyaltyPercentage: "5",
    minimumBidIncrement: "0.05",
    minimumStartingBid: "0.1",
  })

  // Wallet settings state
  const [walletSettings, setWalletSettings] = useState({
    escrowWalletAddress: "0xEscrow123456789abcdef",
    platformWalletAddress: "0xPlatform987654321fedcba",
    adminWalletAddress: "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0",
  })

  // Feature toggle settings
  const [featureToggles, setFeatureToggles] = useState({
    enableEmailNotifications: true,
    enableAutomaticAuctionStart: false,
    enableNFTRoyalties: true,
    enablePublicArtistProfiles: true,
    enableCuratedMode: false,
    enableArtworkReviews: false,
  })

  const handleGeneralSettingsSave = () => {
    // In a real app, this would save to an API or database
    toast.success("General settings saved successfully")
  }

  const handleFeeSettingsSave = () => {
    // In a real app, this would save to an API or database
    toast.success("Fee settings saved successfully")
  }

  const handleWalletSettingsSave = () => {
    // In a real app, this would save to an API or database
    toast.success("Wallet settings saved successfully")
  }

  const handleFeatureToggleSave = () => {
    // In a real app, this would save to an API or database
    toast.success("Feature settings saved successfully")
  }

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="fees">Fees & Pricing</TabsTrigger>
        <TabsTrigger value="wallets">Wallets</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Platform Settings
            </CardTitle>
            <CardDescription>Configure the basic settings for your auction platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input
                id="platform-name"
                value={generalSettings.platformName}
                onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Platform Description</Label>
              <Textarea
                id="description"
                value={generalSettings.description}
                onChange={(e) => setGeneralSettings({ ...generalSettings, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={generalSettings.contactEmail}
                onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featured-artists">Featured Artists Limit</Label>
              <Input
                id="featured-artists"
                type="number"
                min="1"
                max="20"
                value={generalSettings.featuredArtistsLimit}
                onChange={(e) => setGeneralSettings({ ...generalSettings, featuredArtistsLimit: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGeneralSettingsSave}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="fees">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fees & Pricing
            </CardTitle>
            <CardDescription>Configure the fees and pricing for auctions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-fee">Platform Fee Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="platform-fee"
                  type="number"
                  min="0"
                  max="30"
                  value={feeSettings.platformFeePercentage}
                  onChange={(e) => setFeeSettings({ ...feeSettings, platformFeePercentage: e.target.value })}
                  className="max-w-[100px]"
                />
                <span>%</span>
              </div>
              <p className="text-sm text-muted-foreground">Fee taken by the platform from each sale</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="royalty-percentage">Artist Royalty Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="royalty-percentage"
                  type="number"
                  min="0"
                  max="25"
                  value={feeSettings.artistRoyaltyPercentage}
                  onChange={(e) => setFeeSettings({ ...feeSettings, artistRoyaltyPercentage: e.target.value })}
                  className="max-w-[100px]"
                />
                <span>%</span>
              </div>
              <p className="text-sm text-muted-foreground">Royalty percentage for artists on secondary sales</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-bid-increment">Minimum Bid Increment</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="min-bid-increment"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={feeSettings.minimumBidIncrement}
                  onChange={(e) => setFeeSettings({ ...feeSettings, minimumBidIncrement: e.target.value })}
                  className="max-w-[100px]"
                />
                <span>ETH</span>
              </div>
              <p className="text-sm text-muted-foreground">Minimum amount a new bid must exceed the current bid</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-starting-bid">Minimum Starting Bid</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="min-starting-bid"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={feeSettings.minimumStartingBid}
                  onChange={(e) => setFeeSettings({ ...feeSettings, minimumStartingBid: e.target.value })}
                  className="max-w-[100px]"
                />
                <span>ETH</span>
              </div>
              <p className="text-sm text-muted-foreground">Minimum starting bid for any auction</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleFeeSettingsSave}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="wallets">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Settings
            </CardTitle>
            <CardDescription>Configure the platform wallet addresses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="escrow-wallet">Escrow Wallet Address</Label>
              <Input
                id="escrow-wallet"
                value={walletSettings.escrowWalletAddress}
                onChange={(e) => setWalletSettings({ ...walletSettings, escrowWalletAddress: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">All NFTs are held in escrow during auctions</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform-wallet">Platform Wallet Address</Label>
              <Input
                id="platform-wallet"
                value={walletSettings.platformWalletAddress}
                onChange={(e) => setWalletSettings({ ...walletSettings, platformWalletAddress: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">Platform fees are sent to this wallet</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-wallet">Admin Wallet Address</Label>
              <Input
                id="admin-wallet"
                value={walletSettings.adminWalletAddress}
                onChange={(e) => setWalletSettings({ ...walletSettings, adminWalletAddress: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">Only this wallet has admin access</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleWalletSettingsSave}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="features">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Feature Settings
            </CardTitle>
            <CardDescription>Enable or disable platform features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email notifications for bids and auction updates</p>
              </div>
              <Switch
                id="email-notifications"
                checked={featureToggles.enableEmailNotifications}
                onCheckedChange={(checked) =>
                  setFeatureToggles({ ...featureToggles, enableEmailNotifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label htmlFor="auto-auction">Automatic Auction Start</Label>
                <p className="text-sm text-muted-foreground">Automatically start auctions when approved</p>
              </div>
              <Switch
                id="auto-auction"
                checked={featureToggles.enableAutomaticAuctionStart}
                onCheckedChange={(checked) =>
                  setFeatureToggles({ ...featureToggles, enableAutomaticAuctionStart: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label htmlFor="nft-royalties">NFT Royalties</Label>
                <p className="text-sm text-muted-foreground">Enable royalty payments to artists for secondary sales</p>
              </div>
              <Switch
                id="nft-royalties"
                checked={featureToggles.enableNFTRoyalties}
                onCheckedChange={(checked) => setFeatureToggles({ ...featureToggles, enableNFTRoyalties: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label htmlFor="public-profiles">Public Artist Profiles</Label>
                <p className="text-sm text-muted-foreground">Make artist profiles publicly viewable</p>
              </div>
              <Switch
                id="public-profiles"
                checked={featureToggles.enablePublicArtistProfiles}
                onCheckedChange={(checked) =>
                  setFeatureToggles({ ...featureToggles, enablePublicArtistProfiles: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label htmlFor="curated-mode">Curated Mode</Label>
                <p className="text-sm text-muted-foreground">Only approved artists can submit artwork</p>
              </div>
              <Switch
                id="curated-mode"
                checked={featureToggles.enableCuratedMode}
                onCheckedChange={(checked) => setFeatureToggles({ ...featureToggles, enableCuratedMode: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label htmlFor="artwork-reviews">Artwork Reviews</Label>
                <p className="text-sm text-muted-foreground">Enable user reviews and ratings for artworks</p>
              </div>
              <Switch
                id="artwork-reviews"
                checked={featureToggles.enableArtworkReviews}
                onCheckedChange={(checked) => setFeatureToggles({ ...featureToggles, enableArtworkReviews: checked })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleFeatureToggleSave}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
