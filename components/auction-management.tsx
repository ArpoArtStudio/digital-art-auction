"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Play, Pause, Square, Edit, Trash2, Calendar } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

export function AuctionManagement() {
  const [auctions, setAuctions] = useState([
    {
      id: "1",
      title: "Ethereal Dimensions",
      artist: "Digital Visionary",
      currentBid: "0.85",
      status: "active",
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      imageUrl: "/placeholder.svg?height=200&width=300",
      description: "A mesmerizing exploration of digital landscapes that blur the boundaries between reality and imagination.",
      startingPrice: "0.5",
      duration: "7",
    },
    {
      id: "2",
      title: "Digital Dreamscape",
      artist: "Pixel Prophet",
      currentBid: "2.5",
      status: "ended",
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      imageUrl: "/placeholder.svg?height=200&width=300",
      description: "A beautiful journey through a surreal digital landscape depicting dreams and emotions in vibrant colors.",
      startingPrice: "1.0",
      duration: "5",
    },
    {
      id: "3",
      title: "Crypto Canvas",
      artist: "NFT Nomad",
      currentBid: "0.0",
      status: "draft",
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      imageUrl: "/placeholder.svg?height=200&width=300",
      description: "Abstract expressions of blockchain technology and its impact on society through a digital medium.",
      startingPrice: "0.75",
      duration: "7",
    },
  ])
  
  const [searchTerm, setSearchTerm] = useState("")
  const [newAuction, setNewAuction] = useState({
    title: "",
    artist: "",
    startingPrice: "0.5",
    duration: "7",
    imageUrl: "/placeholder.svg?height=200&width=300",
    description: "",
  })
  
  const [editingAuction, setEditingAuction] = useState<null | (typeof auctions)[0]>(null)
  const [deleteAuctionId, setDeleteAuctionId] = useState<string | null>(null)
  const [viewAuction, setViewAuction] = useState<null | (typeof auctions)[0]>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "ended":
        return <Badge variant="secondary">Ended</Badge>
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusActions = (status: string) => {
    switch (status) {
      case "active":
        return (
          <>
            <Button size="sm" variant="outline">
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
            <Button size="sm" variant="destructive">
              <Square className="h-4 w-4 mr-1" />
              End
            </Button>
          </>
        )
      case "draft":
        return (
          <Button size="sm">
            <Play className="h-4 w-4 mr-1" />
            Start
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="all">All Auctions</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>

        <Dialog>
          <DialogTrigger asChild>
            <Button>Create New Auction</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Auction</DialogTitle>
              <DialogDescription>Set up a new auction for an artwork</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="artwork" className="text-right">
                  Artwork
                </Label>
                <Input id="artwork" placeholder="Select artwork..." className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="starting-price" className="text-right">
                  Starting Price
                </Label>
                <Input id="starting-price" placeholder="0.1 ETH" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration (days)
                </Label>
                <Input id="duration" placeholder="7" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Auction</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <TabsContent value="all" className="space-y-4">
        {auctions.map((auction) => (
          <Card key={auction.id}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Image
                  src={auction.imageUrl || "/placeholder.svg"}
                  alt={auction.title}
                  width={100}
                  height={80}
                  className="rounded-md object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{auction.title}</h3>
                      <p className="text-sm text-muted-foreground">by {auction.artist}</p>
                    </div>
                    {getStatusBadge(auction.status)}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Current bid: </span>
                      <span className="font-semibold">{auction.currentBid} ETH</span>
                    </div>
                    <div className="flex space-x-2">
                      {getStatusActions(auction.status)}
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="active">
        {auctions
          .filter((auction) => auction.status === "active")
          .map((auction) => (
            <Card key={auction.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Image
                    src={auction.imageUrl || "/placeholder.svg"}
                    alt={auction.title}
                    width={100}
                    height={80}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{auction.title}</h3>
                        <p className="text-sm text-muted-foreground">by {auction.artist}</p>
                      </div>
                      {getStatusBadge(auction.status)}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Current bid: </span>
                        <span className="font-semibold">{auction.currentBid} ETH</span>
                      </div>
                      <div className="flex space-x-2">
                        {getStatusActions(auction.status)}
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </TabsContent>

      <TabsContent value="ended">
        {auctions
          .filter((auction) => auction.status === "ended")
          .map((auction) => (
            <Card key={auction.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Image
                    src={auction.imageUrl || "/placeholder.svg"}
                    alt={auction.title}
                    width={100}
                    height={80}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{auction.title}</h3>
                        <p className="text-sm text-muted-foreground">by {auction.artist}</p>
                      </div>
                      {getStatusBadge(auction.status)}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Final bid: </span>
                        <span className="font-semibold">{auction.currentBid} ETH</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </TabsContent>

      <TabsContent value="draft">
        {auctions
          .filter((auction) => auction.status === "draft")
          .map((auction) => (
            <Card key={auction.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Image
                    src={auction.imageUrl || "/placeholder.svg"}
                    alt={auction.title}
                    width={100}
                    height={80}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{auction.title}</h3>
                        <p className="text-sm text-muted-foreground">by {auction.artist}</p>
                      </div>
                      {getStatusBadge(auction.status)}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Starting price: </span>
                        <span className="font-semibold">0.5 ETH</span>
                      </div>
                      <div className="flex space-x-2">
                        {getStatusActions(auction.status)}
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </TabsContent>
    </Tabs>
  )
}
