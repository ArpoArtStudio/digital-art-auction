"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Wallet, Globe, DollarSign, Bell, Shield, Plus, Trash2 } from "lucide-react"
import { useFeatures } from "@/contexts/feature-context"

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
    minimumStartingBid: "0.1",
  })

  // Get feature context
  const { features, walletSettings, updateFeatures, updateWalletSettings } = useFeatures()
  
  // Admin wallets state - changed from single wallet to array of wallets
  const [adminWallets, setAdminWallets] = useState([
    "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0"
  ])

  // Temporary state for new admin wallet input
  const [newAdminWallet, setNewAdminWallet] = useState("")

  // Local state for feature toggles (synced with context)
  const [featureToggles, setFeatureToggles] = useState(features)

  // Load admin wallets from localStorage on mount
  useEffect(() => {
    const storedAdminWallets = localStorage.getItem('adminWallets')
    if (storedAdminWallets) {
      try {
        const parsedWallets = JSON.parse(storedAdminWallets)
        if (Array.isArray(parsedWallets) && parsedWallets.length > 0) {
          setAdminWallets(parsedWallets)
        }
      } catch (e) {
        console.error("Error parsing admin wallets:", e)
      }
    }
  }, [])

  // Update local feature toggles when context changes
  useEffect(() => {
    setFeatureToggles(features)
  }, [features])

  const handleGeneralSettingsSave = () => {
    // In a real app, this would save to an API or database
    toast.success("General settings saved successfully")
  }

  const handleFeeSettingsSave = () => {
    // In a real app, this would save to an API or database
    toast.success("Fee settings saved successfully")
  }

  const handleWalletSettingsSave = () => {
    // Save admin wallets to local storage for the wallet context to use
    localStorage.setItem('adminWallets', JSON.stringify(adminWallets))
    
    // Update wallet settings in the feature context
    updateWalletSettings({
      escrowWalletAddress: walletSettings.escrowWalletAddress,
      platformWalletAddress: walletSettings.platformWalletAddress
    })
    
    toast.success("Wallet settings saved successfully")
  }

  const handleFeatureToggleSave = () => {
    // Update feature toggles in the context
    updateFeatures(featureToggles)
    toast.success("Feature settings saved successfully")
  }

  // Add a new admin wallet
  const addAdminWallet = () => {
    // Simple validation
    if (!newAdminWallet.trim() || !newAdminWallet.startsWith('0x')) {
      toast.error("Please enter a valid wallet address starting with 0x")
      return
    }

    // Check for duplicates
    if (adminWallets.includes(newAdminWallet)) {
      toast.error("This wallet is already in the admin list")
      return
    }

    setAdminWallets([...adminWallets, newAdminWallet])
    setNewAdminWallet("") // Clear the input
    toast.success("Admin wallet added")
  }

  // Remove an admin wallet
  const removeAdminWallet = (walletToRemove: string) => {
    // Don't allow removing the last wallet
    if (adminWallets.length <= 1) {
      toast.error("You must have at least one admin wallet")
      return
    }

    setAdminWallets(adminWallets.filter(wallet => wallet !== walletToRemove))
    toast.success("Admin wallet removed")
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

      <TabsContent value="fees" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Fees & Pricing</CardTitle>
            <CardDescription>
              Configure the fees and pricing for auctions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="platformFeePercentage">Platform Fee Percentage</Label>
              <Input
                id="platformFeePercentage"
                type="number"
                min={0}
                max={100}
                value={feeSettings.platformFeePercentage}
                onChange={e => setFeeSettings({ ...feeSettings, platformFeePercentage: e.target.value })}
                className="max-w-xs"
              />
              <span className="ml-2">%</span>
              <div className="text-xs text-muted-foreground">Fee taken by the platform from each sale</div>
            </div>
            <div>
              <Label htmlFor="artistRoyaltyPercentage">Artist Royalty Percentage</Label>
              <Input
                id="artistRoyaltyPercentage"
                type="number"
                min={0}
                max={100}
                value={feeSettings.artistRoyaltyPercentage}
                onChange={e => setFeeSettings({ ...feeSettings, artistRoyaltyPercentage: e.target.value })}
                className="max-w-xs"
              />
              <span className="ml-2">%</span>
              <div className="text-xs text-muted-foreground">Royalty percentage for artists on secondary sales</div>
            </div>
            <div>
              <Label htmlFor="minimumStartingBid">Minimum Starting Bid</Label>
              <Input
                id="minimumStartingBid"
                type="number"
                min={0}
                step="0.01"
                value={feeSettings.minimumStartingBid}
                onChange={e => setFeeSettings({ ...feeSettings, minimumStartingBid: e.target.value })}
                className="max-w-xs"
              />
              <span className="ml-2">ETH</span>
              <div className="text-xs text-muted-foreground">Minimum starting bid for any auction</div>
            </div>
            <div className="text-xs text-muted-foreground">
              <strong>Note:</strong> Minimum bid increment is fixed at 1%. Maximum bid increment is fixed at 10%.
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
                onChange={(e) => updateWalletSettings({ escrowWalletAddress: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">All NFTs are held in escrow during auctions</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform-wallet">Platform Wallet Address</Label>
              <Input
                id="platform-wallet"
                value={walletSettings.platformWalletAddress}
                onChange={(e) => updateWalletSettings({ platformWalletAddress: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">Platform fees are sent to this wallet</p>
            </div>
            
            <div className="space-y-2">
              <Label>Admin Wallet Addresses</Label>
              <p className="text-sm text-muted-foreground mb-2">These wallets have admin access to the platform</p>
              
              <div className="space-y-2">
                {adminWallets.map((wallet, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input 
                      value={wallet} 
                      readOnly
                      className="flex-grow"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeAdminWallet(wallet)}
                      disabled={adminWallets.length <= 1} // Prevent removing the last wallet
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  placeholder="New admin wallet address (0x...)"
                  value={newAdminWallet}
                  onChange={(e) => setNewAdminWallet(e.target.value)}
                  className="flex-grow"
                />
                <Button 
                  onClick={addAdminWallet} 
                  variant="outline" 
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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
