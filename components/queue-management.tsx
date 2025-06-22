"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUp, ArrowDown, Play, Trash2, Eye, AlertTriangle, CheckCircle } from "lucide-react"
import Image from "next/image"

export function QueueManagement() {
  const [queueItems, setQueueItems] = useState([
    {
      id: "1",
      title: "Cosmic Dreams",
      artist: "Digital Visionary",
      artistWallet: "0x1234...5678",
      imageUrl: "/placeholder.svg?height=100&width=150",
      startingPrice: "0.5",
      category: "Digital Art",
      status: "approved",
      queuePosition: 1,
      submittedAt: "2024-01-15",
      nftContract: "0xContract1...123",
      tokenId: "456",
    },
    {
      id: "2",
      title: "Neon Nights",
      artist: "Pixel Prophet",
      artistWallet: "0x8765...4321",
      imageUrl: "/placeholder.svg?height=100&width=150",
      startingPrice: "0.8",
      category: "Photography",
      status: "pending",
      queuePosition: 2,
      submittedAt: "2024-01-16",
      nftContract: "0xContract2...456",
      tokenId: "789",
    },
    {
      id: "3",
      title: "Abstract Reality",
      artist: "Crypto Canvas",
      artistWallet: "0x5432...8765",
      imageUrl: "/placeholder.svg?height=100&width=150",
      startingPrice: "1.2",
      category: "3D Models",
      status: "rejected",
      queuePosition: null,
      submittedAt: "2024-01-17",
      nftContract: "0xContract3...789",
      tokenId: "101",
      rejectionReason: "Violates content policy",
    },
  ])

  const [removedItems] = useState([
    {
      id: "4",
      title: "Inappropriate Content",
      artist: "Bad Actor",
      artistWallet: "0x9999...0000",
      imageUrl: "/placeholder.svg?height=100&width=150",
      startingPrice: "2.0",
      category: "Digital Art",
      status: "removed",
      removedAt: "2024-01-10",
      removalReason: "Violated platform rules",
    },
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "pending":
        return <Badge variant="secondary">Pending Review</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "removed":
        return <Badge variant="outline">Removed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const moveInQueue = (id: string, direction: "up" | "down") => {
    setQueueItems((prev) => {
      const items = [...prev]
      const index = items.findIndex((item) => item.id === id)
      if (index === -1) return prev

      const newIndex = direction === "up" ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= items.length)
        return (prev[
          // Swap positions
          (items[index], items[newIndex])
        ] = [items[newIndex], items[index]])

      // Update queue positions
      items.forEach((item, idx) => {
        if (item.status === "approved") {
          item.queuePosition = idx + 1
        }
      })

      return items
    })
  }

  const approveItem = (id: string) => {
    setQueueItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "approved", queuePosition: prev.filter((i) => i.status === "approved").length + 1 }
          : item,
      ),
    )
  }

  const rejectItem = (id: string, reason: string) => {
    setQueueItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "rejected", queuePosition: null, rejectionReason: reason } : item,
      ),
    )
  }

  const removeItem = (id: string, reason: string) => {
    setQueueItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "removed", queuePosition: null, removalReason: reason } : item,
      ),
    )
  }

  const startAuction = (id: string) => {
    console.log(`Starting auction for item ${id}`)
    alert("Auction started! (Demo mode)")
  }

  return (
    <Tabs defaultValue="queue" className="space-y-6">
      <TabsList>
        <TabsTrigger value="queue">Active Queue</TabsTrigger>
        <TabsTrigger value="pending">Pending Review</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
        <TabsTrigger value="removed">Removed</TabsTrigger>
      </TabsList>

      <TabsContent value="queue" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Approved Queue ({queueItems.filter((item) => item.status === "approved").length} items)
          </h3>
          <div className="text-sm text-muted-foreground">
            Escrow Wallet: <code className="bg-muted px-2 py-1 rounded">0xEscrow123...456</code>
          </div>
        </div>

        {queueItems
          .filter((item) => item.status === "approved")
          .sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0))
          .map((item, index) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {item.queuePosition}
                    </div>
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.title}
                      width={100}
                      height={80}
                      className="rounded-md object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">by {item.artist}</p>
                        <p className="text-xs text-muted-foreground">{item.artistWallet}</p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm space-x-4">
                        <span>
                          <strong>Starting:</strong> {item.startingPrice} ETH
                        </span>
                        <span>
                          <strong>Category:</strong> {item.category}
                        </span>
                        <span>
                          <strong>Submitted:</strong> {item.submittedAt}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveInQueue(item.id, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveInQueue(item.id, "down")}
                          disabled={index === queueItems.filter((i) => i.status === "approved").length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        {index === 0 && (
                          <Button size="sm" onClick={() => startAuction(item.id)}>
                            <Play className="h-4 w-4 mr-1" />
                            Start Auction
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove Artwork</DialogTitle>
                              <DialogDescription>
                                This will remove the artwork from the queue. The artist will still need to pay the 0.1
                                ETH penalty to retrieve their NFT.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Input placeholder="Reason for removal..." />
                            </div>
                            <DialogFooter>
                              <Button variant="outline">Cancel</Button>
                              <Button variant="destructive" onClick={() => removeItem(item.id, "Admin removal")}>
                                Remove Artwork
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </TabsContent>

      <TabsContent value="pending" className="space-y-4">
        <h3 className="text-lg font-semibold">
          Pending Review ({queueItems.filter((item) => item.status === "pending").length} items)
        </h3>

        {queueItems
          .filter((item) => item.status === "pending")
          .map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.title}
                    width={100}
                    height={80}
                    className="rounded-md object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">by {item.artist}</p>
                        <p className="text-xs text-muted-foreground">{item.artistWallet}</p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm space-x-4">
                        <span>
                          <strong>Starting:</strong> {item.startingPrice} ETH
                        </span>
                        <span>
                          <strong>Category:</strong> {item.category}
                        </span>
                        <span>
                          <strong>Submitted:</strong> {item.submittedAt}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" onClick={() => approveItem(item.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Artwork</DialogTitle>
                              <DialogDescription>
                                Provide a reason for rejecting this artwork submission.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Input placeholder="Reason for rejection..." />
                            </div>
                            <DialogFooter>
                              <Button variant="outline">Cancel</Button>
                              <Button
                                variant="destructive"
                                onClick={() => rejectItem(item.id, "Content policy violation")}
                              >
                                Reject Artwork
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </TabsContent>

      <TabsContent value="rejected" className="space-y-4">
        <h3 className="text-lg font-semibold">
          Rejected Items ({queueItems.filter((item) => item.status === "rejected").length} items)
        </h3>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artwork</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queueItems
              .filter((item) => item.status === "rejected")
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Image
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.title}
                        width={50}
                        height={40}
                        className="rounded object-cover"
                      />
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.artist}</TableCell>
                  <TableCell>{item.rejectionReason}</TableCell>
                  <TableCell>{item.submittedAt}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      Review Again
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="removed" className="space-y-4">
        <h3 className="text-lg font-semibold">Removed Items ({removedItems.length} items)</h3>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artwork</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Removal Reason</TableHead>
              <TableHead>Removed Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {removedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.title}
                      width={50}
                      height={40}
                      className="rounded object-cover"
                    />
                    <span className="font-medium">{item.title}</span>
                  </div>
                </TableCell>
                <TableCell>{item.artist}</TableCell>
                <TableCell>{item.removalReason}</TableCell>
                <TableCell>{item.removedAt}</TableCell>
                <TableCell>
                  <Badge variant="outline">Penalty Required</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  )
}
