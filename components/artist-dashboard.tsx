"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Palette, TrendingUp, Clock, CheckCircle, XCircle, Eye } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { getArtistProfile, getArtistSubmissions, getArtistStats, getArtistBadge, ArtistProfile, ArtworkSubmission } from "@/lib/artist-utils"
import { ArtistBadge } from "@/components/artist-badge"
import Image from "next/image"

interface ArtistDashboardProps {
  onNewSubmission: () => void
}

export function ArtistDashboard({ onNewSubmission }: ArtistDashboardProps) {
  const { walletAddress } = useWallet()
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null)
  const [submissions, setSubmissions] = useState<ArtworkSubmission[]>([])
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    liveAuctions: 0,
    soldArtworks: 0,
  })

  useEffect(() => {
    if (walletAddress) {
      const profile = getArtistProfile(walletAddress)
      const userSubmissions = getArtistSubmissions(walletAddress)
      const userStats = getArtistStats(walletAddress)
      
      setArtistProfile(profile)
      setSubmissions(userSubmissions)
      setStats(userStats)
    }
  }, [walletAddress])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "approved":
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "live":
        return <Badge variant="default" className="bg-green-500"><Eye className="h-3 w-3 mr-1" />Live</Badge>
      case "sold":
        return <Badge variant="default" className="bg-blue-500"><TrendingUp className="h-3 w-3 mr-1" />Sold</Badge>
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!artistProfile) {
    return null
  }

  // Get artist badge
  const badge = getArtistBadge(stats.totalSubmissions)

  return (
    <div className="space-y-6">
      {/* Artist Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border">
              <Image
                src={artistProfile.avatarUrl}
                alt={artistProfile.name}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {artistProfile.name}
                    {badge && <ArtistBadge badge={badge} size="sm" />}
                    {getStatusBadge(artistProfile.status)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {artistProfile.specialization} • Joined {new Date(artistProfile.joinDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button onClick={onNewSubmission} className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Submit New Artwork
                </Button>
              </div>
              {artistProfile.bio && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {artistProfile.bio}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalSubmissions}</div>
            <div className="text-xs text-muted-foreground">Total Submissions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.pendingSubmissions}</div>
            <div className="text-xs text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.approvedSubmissions}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.liveAuctions}</div>
            <div className="text-xs text-muted-foreground">Live Auctions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.soldArtworks}</div>
            <div className="text-xs text-muted-foreground">Sold</div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Artwork Submissions</CardTitle>
          <CardDescription>
            Track the status of your submitted artworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No submissions yet</p>
              <p className="text-sm">Submit your first artwork to get started!</p>
              <Button onClick={onNewSubmission} className="mt-4">
                Submit Your First Artwork
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {submission.imageUrl && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border">
                        <Image
                          src={submission.imageUrl}
                          alt={submission.title}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{submission.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {submission.category} • Starting at {submission.startingPrice} ETH
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(submission.status)}
                    {submission.queuePosition && (
                      <Badge variant="outline">
                        Queue #{submission.queuePosition}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
