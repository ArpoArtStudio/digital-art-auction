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
import { ArrowUp, ArrowDown, Play, Trash2, Eye, AlertTriangle, CheckCircle, Calendar, Clock, Zap } from "lucide-react"
import { format, parseISO, addDays } from "date-fns"
import Image from "next/image"
import { toast } from "sonner"
import { 
  reorganizeQueueWithPriority, 
  detectConflicts, 
  emergencyReorganization,
  validateSchedulingRequest,
  QueueItem as SchedulerQueueItem 
} from "@/lib/queue-scheduler"

interface QueueItem {
  id: string
  title: string
  artist: string
  artistWallet: string
  imageUrl: string
  startingPrice: string
  category: string
  status: "approved" | "pending" | "rejected" | "removed"
  queuePosition: number | null
  submittedAt: string
  nftContract: string
  tokenId: string
  rejectionReason?: string
  removalReason?: string
  schedulingMode?: "basic" | "custom"
  customDate?: string
  customTime?: string
  duration: string
  scheduledStartDate?: string
  scheduledEndDate?: string
}

export function QueueManagement() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([
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
      schedulingMode: "basic",
      duration: "7",
      scheduledStartDate: "2024-06-26T00:00:00Z",
      scheduledEndDate: "2024-07-03T00:00:00Z",
    },
    {
      id: "2",
      title: "Neon Nights",
      artist: "Pixel Prophet",
      artistWallet: "0x8765...4321",
      imageUrl: "/placeholder.svg?height=100&width=150",
      startingPrice: "0.8",
      category: "Photography",
      status: "approved",
      queuePosition: 2,
      submittedAt: "2024-01-16",
      nftContract: "0xContract2...456",
      tokenId: "789",
      schedulingMode: "basic",
      duration: "3",
      scheduledStartDate: "2024-07-03T00:00:00Z",
      scheduledEndDate: "2024-07-06T00:00:00Z",
    },
    {
      id: "3",
      title: "Ethereal Dimensions",
      artist: "Crypto Canvas",
      artistWallet: "0x5432...8765",
      imageUrl: "/placeholder.svg?height=100&width=150",
      startingPrice: "0.85",
      category: "3D Models",
      status: "approved",
      queuePosition: 3,
      submittedAt: "2024-01-17",
      nftContract: "0xContract3...789",
      tokenId: "101",
      schedulingMode: "custom",
      customDate: "2024-07-15",
      customTime: "18:00",
      duration: "7",
      scheduledStartDate: "2024-07-15T18:00:00Z",
      scheduledEndDate: "2024-07-22T18:00:00Z",
    },
    {
      id: "4",
      title: "Abstract Reality",
      artist: "Digital Master",
      artistWallet: "0x9876...1234",
      imageUrl: "/placeholder.svg?height=100&width=150",
      startingPrice: "1.2",
      category: "Digital Art",
      status: "pending",
      queuePosition: null,
      submittedAt: "2024-01-18",
      nftContract: "0xContract4...012",
      tokenId: "234",
      schedulingMode: "basic",
      duration: "7",
    },
  ])

  const [removedItems] = useState([
    {
      id: "5",
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

  const getSchedulingBadge = (item: QueueItem) => {
    if (item.schedulingMode === "custom") {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Calendar className="h-3 w-3 mr-1" />
          Custom Schedule
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Clock className="h-3 w-3 mr-1" />
        Basic Queue
      </Badge>
    )
  }

  const formatScheduledTime = (item: QueueItem) => {
    if (item.schedulingMode === "custom" && item.customDate && item.customTime) {
      try {
        const dateTime = parseISO(`${item.customDate}T${item.customTime}:00`)
        return format(dateTime, "MMM dd, yyyy 'at' h:mm a")
      } catch {
        return `${item.customDate} at ${item.customTime}`
      }
    }
    
    if (item.scheduledStartDate) {
      try {
        const startDate = parseISO(item.scheduledStartDate)
        return format(startDate, "MMM dd, yyyy 'at' h:mm a")
      } catch {
        return "TBD"
      }
    }
    
    return "Next available slot"
  }

  const reorganizeQueue = () => {
    setQueueItems((prev) => {
      const approvedItems = prev.filter((item) => item.status === "approved")
      
      // Convert to scheduler format, ensuring all required fields are present
      const schedulerItems: SchedulerQueueItem[] = approvedItems.map(item => ({
        id: item.id,
        title: item.title,
        artist: item.artist,
        artistWallet: item.artistWallet,
        imageUrl: item.imageUrl,
        startingPrice: item.startingPrice,
        category: item.category,
        status: item.status,
        queuePosition: item.queuePosition,
        submittedAt: item.submittedAt,
        nftContract: item.nftContract,
        tokenId: item.tokenId,
        schedulingMode: item.schedulingMode || "basic",
        customDate: item.customDate,
        customTime: item.customTime,
        duration: item.duration,
        scheduledStartDate: item.scheduledStartDate,
        scheduledEndDate: item.scheduledEndDate,
        priority: item.schedulingMode === "custom" ? "high" : "medium"
      }))
      
      // Use the queue scheduler
      const reorganized = reorganizeQueueWithPriority(schedulerItems)
      
      // Check for conflicts in the reorganized queue
      const allConflicts: any[] = []
      reorganized.forEach(item => {
        const conflicts = detectConflicts(item, reorganized.filter(i => i.id !== item.id))
        allConflicts.push(...conflicts)
      })
      
      if (allConflicts.length > 0) {
        console.warn("Queue conflicts detected:", allConflicts)
        toast("⚠️ Queue conflicts detected - check console for details", {
          description: `${allConflicts.length} potential scheduling conflicts found`
        })
      }
      
      // Return reorganized items + non-approved items unchanged
      return [
        ...reorganized,
        ...prev.filter(item => item.status !== "approved")
      ]
    })
    
    toast.success("🚀 Queue reorganized with advanced priority scheduling!")
  }

  // Emergency reorganization function for urgent situations
  const emergencyReorganizeQueue = () => {
    setQueueItems((prev) => {
      const approvedItems = prev.filter((item) => item.status === "approved")
      
      // Convert to scheduler format with emergency priority
      const schedulerItems: SchedulerQueueItem[] = approvedItems.map(item => ({
        id: item.id,
        title: item.title,
        artist: item.artist,
        artistWallet: item.artistWallet,
        imageUrl: item.imageUrl,
        startingPrice: item.startingPrice,
        category: item.category,
        status: item.status,
        queuePosition: item.queuePosition,
        submittedAt: item.submittedAt,
        nftContract: item.nftContract,
        tokenId: item.tokenId,
        schedulingMode: item.schedulingMode || "basic",
        customDate: item.customDate,
        customTime: item.customTime,
        duration: item.duration,
        scheduledStartDate: item.scheduledStartDate,
        scheduledEndDate: item.scheduledEndDate,
        priority: "high" // Emergency priority for all items
      }))
      
      const reorganized = reorganizeQueueWithPriority(schedulerItems)
      
      return [
        ...reorganized,
        ...prev.filter(item => item.status !== "approved")
      ]
    })
    
    toast.success("🚨 Emergency queue reorganization completed!")
  }

  const moveInQueue = (id: string, direction: "up" | "down") => {
    setQueueItems((prev) => {
      const items = [...prev.filter(item => item.status === "approved")]
      const index = items.findIndex((item) => item.id === id)
      if (index === -1) return prev

      const newIndex = direction === "up" ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= items.length) return prev

      // Only allow moving basic queue items, not custom scheduled items
      if (items[index].schedulingMode === "custom") {
        alert("Cannot move custom scheduled items. They have fixed time slots.")
        return prev
      }

      // Swap positions
      ;[items[index], items[newIndex]] = [items[newIndex], items[index]]

      // Update queue positions for basic items only
      items.forEach((item, idx) => {
        if (item.schedulingMode === "basic") {
          item.queuePosition = idx + 1
        }
      })

      // Return updated items merged with non-approved items
      return [
        ...items,
        ...prev.filter(item => item.status !== "approved")
      ]
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
    
    // Reorganize queue after approval
    setTimeout(() => {
      reorganizeQueue()
    }, 100)
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
          <div className="flex items-center gap-4">
            <Button 
              onClick={reorganizeQueue}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Reorganize Queue
            </Button>
            <Button 
              onClick={emergencyReorganizeQueue}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Emergency Reorganize
            </Button>
            <div className="text-sm text-muted-foreground">
              Escrow Wallet: <code className="bg-muted px-2 py-1 rounded">0xEscrow123...456</code>
            </div>
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
                      <div className="flex items-center gap-2">
                        {getSchedulingBadge(item)}
                        {getStatusBadge(item.status)}
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Starting Price:</span> {item.startingPrice} ETH
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Category:</span> {item.category}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Duration:</span> {item.duration} days
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Scheduled:</span> {formatScheduledTime(item)}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Submitted:</span> {item.submittedAt}
                        </div>
                        {item.schedulingMode === "custom" && (
                          <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                            Custom time slot: {item.customDate} at {item.customTime}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveInQueue(item.id, "up")}
                          disabled={index === 0 || item.schedulingMode === "custom"}
                          title={item.schedulingMode === "custom" ? "Cannot move custom scheduled items" : "Move up in queue"}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveInQueue(item.id, "down")}
                          disabled={index === queueItems.filter((i) => i.status === "approved").length - 1 || item.schedulingMode === "custom"}
                          title={item.schedulingMode === "custom" ? "Cannot move custom scheduled items" : "Move down in queue"}
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
