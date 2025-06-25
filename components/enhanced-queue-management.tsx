"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Image as ImageIcon, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star
} from "lucide-react"

interface QueuedAuction {
  id: string
  title: string
  artist: string
  email?: string
  submissionDate: string
  scheduledDate?: string
  scheduledTime?: string
  duration: string
  hours?: string
  minutes?: string
  type: "standard" | "custom"
  status: "pending" | "scheduled" | "confirmed" | "processing"
  priority: number
  image?: string
  startingPrice: string
  category: string
  customRequest?: {
    requestedDate: string
    requestedTime: string
    reason?: string
  }
}

interface EnhancedQueueManagementProps {
  onUpdateQueue?: (queue: QueuedAuction[]) => void
  onScheduleAuction?: (auction: QueuedAuction) => void
}

export function EnhancedQueueManagement({ onUpdateQueue, onScheduleAuction }: EnhancedQueueManagementProps) {
  const [queue, setQueue] = useState<QueuedAuction[]>([
    // Mock data for demonstration
    {
      id: "1",
      title: "Digital Dreams #1",
      artist: "artist.eth",
      email: "artist@example.com",
      submissionDate: "2025-06-25T10:00:00Z",
      duration: "1",
      hours: "24",
      minutes: "0",
      type: "standard",
      status: "pending",
      priority: 1,
      startingPrice: "0.1",
      category: "digital-art"
    },
    {
      id: "2",
      title: "Cyber Landscape",
      artist: "creator.eth",
      email: "creator@example.com",
      submissionDate: "2025-06-25T12:00:00Z",
      duration: "2",
      type: "custom",
      status: "pending",
      priority: 0, // Custom requests get priority 0
      startingPrice: "0.25",
      category: "3d-art",
      customRequest: {
        requestedDate: "2025-06-27",
        requestedTime: "16:30",
        reason: "Important gallery opening coordination"
      }
    },
    {
      id: "3",
      title: "Abstract Emotions",
      artist: "artist2.eth",
      submissionDate: "2025-06-24T15:00:00Z",
      scheduledDate: "2025-06-28",
      scheduledTime: "12:00",
      duration: "1",
      hours: "18",
      minutes: "30",
      type: "standard",
      status: "scheduled",
      priority: 2,
      startingPrice: "0.15",
      category: "abstract"
    },
    {
      id: "4",
      title: "Pixel Paradise",
      artist: "pixelmaster.eth",
      email: "pixel@example.com",
      submissionDate: "2025-06-25T08:00:00Z",
      duration: "3",
      type: "standard",
      status: "pending",
      priority: 3,
      startingPrice: "0.08",
      category: "pixel-art"
    }
  ])

  const [selectedAuction, setSelectedAuction] = useState<QueuedAuction | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  // Sort queue by priority (0 = highest priority for custom requests)
  const sortedQueue = [...queue].sort((a, b) => {
    if (a.type === "custom" && b.type !== "custom") return -1
    if (a.type !== "custom" && b.type === "custom") return 1
    if (a.type === "custom" && b.type === "custom") return a.priority - b.priority
    return a.priority - b.priority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "scheduled": return "bg-blue-100 text-blue-800"
      case "confirmed": return "bg-green-100 text-green-800"
      case "processing": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "custom" ? <Star className="h-4 w-4" /> : <Clock className="h-4 w-4" />
  }

  const handlePriorityChange = (id: string, direction: "up" | "down") => {
    setQueue(prev => {
      const newQueue = [...prev]
      const index = newQueue.findIndex(item => item.id === id)
      if (index === -1) return prev

      const item = newQueue[index]
      if (direction === "up" && index > 0) {
        // Swap with the item above
        const temp = newQueue[index - 1].priority
        newQueue[index - 1].priority = item.priority
        newQueue[index].priority = temp
      } else if (direction === "down" && index < newQueue.length - 1) {
        // Swap with the item below
        const temp = newQueue[index + 1].priority
        newQueue[index + 1].priority = item.priority
        newQueue[index].priority = temp
      }

      return newQueue
    })
  }

  const handleStatusChange = (id: string, newStatus: QueuedAuction['status']) => {
    setQueue(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      )
    )
  }

  const handleScheduleAuction = (auction: QueuedAuction) => {
    // Auto-schedule logic would go here
    const nextAvailableSlot = getNextAvailableSlot()
    
    setQueue(prev =>
      prev.map(item =>
        item.id === auction.id
          ? {
              ...item,
              status: "scheduled",
              scheduledDate: nextAvailableSlot.date,
              scheduledTime: nextAvailableSlot.time
            }
          : item
      )
    )

    onScheduleAuction?.(auction)
  }

  const getNextAvailableSlot = () => {
    // Simple logic - in reality this would check against existing auctions
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return {
      date: tomorrow.toISOString().split('T')[0],
      time: "14:00"
    }
  }

  const filterQueue = (filter: string) => {
    switch (filter) {
      case "pending": return sortedQueue.filter(item => item.status === "pending")
      case "scheduled": return sortedQueue.filter(item => item.status === "scheduled")
      case "custom": return sortedQueue.filter(item => item.type === "custom")
      case "standard": return sortedQueue.filter(item => item.type === "standard")
      default: return sortedQueue
    }
  }

  const formatDuration = (auction: QueuedAuction) => {
    if (auction.duration === "1" && auction.hours && auction.minutes) {
      return `${auction.hours}h ${auction.minutes}m`
    }
    return `${auction.duration} day${auction.duration !== "1" ? "s" : ""}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Enhanced Auction Queue Management
        </CardTitle>
        <CardDescription>
          Manage submission queue with priority handling for custom scheduling requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({queue.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({queue.filter(q => q.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              Scheduled ({queue.filter(q => q.status === "scheduled").length})
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Custom ({queue.filter(q => q.type === "custom").length})
            </TabsTrigger>
            <TabsTrigger value="standard">
              Standard ({queue.filter(q => q.type === "standard").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filterQueue(activeTab).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No auctions in this category
              </div>
            ) : (
              filterQueue(activeTab).map((auction, index) => (
                <div
                  key={auction.id}
                  className={`
                    border rounded-lg p-4 transition-all hover:shadow-md
                    ${auction.type === "custom" ? "border-purple-200 bg-purple-50" : ""}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg"># {index + 1}</span>
                        {getTypeIcon(auction.type)}
                        <h4 className="font-semibold">{auction.title}</h4>
                        <Badge className={getStatusColor(auction.status)}>
                          {auction.status}
                        </Badge>
                        {auction.type === "custom" && (
                          <Badge className="bg-purple-100 text-purple-800">
                            Priority Request
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {auction.artist}
                        </div>
                        {auction.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {auction.email}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Duration: {formatDuration(auction)}
                        </div>
                        <div className="flex items-center gap-1">
                          <ImageIcon className="h-4 w-4" />
                          {auction.startingPrice} ETH
                        </div>
                      </div>

                      {/* Custom Request Details */}
                      {auction.customRequest && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Custom Scheduling Request:</strong><br />
                            Requested: {new Date(auction.customRequest.requestedDate).toLocaleDateString()} at {auction.customRequest.requestedTime}
                            {auction.customRequest.reason && (
                              <><br />Reason: {auction.customRequest.reason}</>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Scheduled Details */}
                      {auction.scheduledDate && (
                        <div className="bg-blue-50 border border-blue-200 p-2 rounded">
                          <strong>Scheduled:</strong> {new Date(auction.scheduledDate).toLocaleDateString()} at {auction.scheduledTime}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Priority Controls */}
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePriorityChange(auction.id, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePriorityChange(auction.id, "down")}
                          disabled={index === filterQueue(activeTab).length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Auction Details: {auction.title}</DialogTitle>
                              <DialogDescription>
                                Full submission details and management options
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <strong>Artist:</strong> {auction.artist}
                                </div>
                                <div>
                                  <strong>Category:</strong> {auction.category}
                                </div>
                                <div>
                                  <strong>Starting Price:</strong> {auction.startingPrice} ETH
                                </div>
                                <div>
                                  <strong>Duration:</strong> {formatDuration(auction)}
                                </div>
                                <div>
                                  <strong>Submitted:</strong> {new Date(auction.submissionDate).toLocaleString()}
                                </div>
                                <div>
                                  <strong>Status:</strong> {auction.status}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleStatusChange(auction.id, "confirmed")}
                                  disabled={auction.status === "confirmed"}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handleScheduleAuction(auction)}
                                  disabled={auction.status === "scheduled"}
                                >
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Auto-Schedule
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleStatusChange(auction.id, "pending")}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
