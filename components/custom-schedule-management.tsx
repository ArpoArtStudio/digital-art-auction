"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { CheckCircle, X, Calendar, Clock, AlertTriangle, User } from "lucide-react"
import { format, parseISO } from "date-fns"
import { toast } from "sonner"
import Image from "next/image"

interface CustomScheduleRequest {
  id: string
  title: string
  artist: string
  artistWallet: string
  imageUrl: string
  startingPrice: string
  duration: string
  requestedDate: string
  requestedTime: string
  submittedAt: string
  status: "pending" | "approved" | "rejected"
  rejectionReason?: string
  conflictsWith?: string[]
}

export function CustomScheduleManagement() {
  const [requests, setRequests] = useState<CustomScheduleRequest[]>([
    {
      id: "cs-1",
      title: "Ethereal Dimensions",
      artist: "Digital Visionary",
      artistWallet: "0x1234...5678",
      imageUrl: "/placeholder.svg?height=100&width=150",
      startingPrice: "0.85",
      duration: "7",
      requestedDate: "2024-07-15",
      requestedTime: "18:00",
      submittedAt: "2024-06-25T10:30:00Z",
      status: "pending",
    },
    {
      id: "cs-2",
      title: "Neon Nights",
      artist: "Pixel Prophet",
      artistWallet: "0x8765...4321",
      imageUrl: "/placeholder.svg?height=100&width=150",
      startingPrice: "1.2",
      duration: "3",
      requestedDate: "2024-07-15",
      requestedTime: "20:00",
      submittedAt: "2024-06-24T14:15:00Z",
      status: "pending",
      conflictsWith: ["cs-1"],
    },
    {
      id: "cs-3",
      title: "Abstract Reality",
      artist: "Crypto Canvas",
      artistWallet: "0x5432...8765",
      imageUrl: "/placeholder.svg?height=100&width=150",
      startingPrice: "0.95",
      duration: "7",
      requestedDate: "2024-08-01",
      requestedTime: "16:00",
      submittedAt: "2024-06-23T09:45:00Z",
      status: "approved",
    },
  ])

  const [selectedRequest, setSelectedRequest] = useState<CustomScheduleRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTime = parseISO(`${date}T${time}:00`)
      return format(dateTime, "MMM dd, yyyy 'at' h:mm a")
    } catch {
      return `${date} at ${time}`
    }
  }

  const checkConflicts = (requestId: string, date: string, time: string, duration: string) => {
    const requestDateTime = new Date(`${date}T${time}:00`)
    const requestEndTime = new Date(requestDateTime.getTime() + parseInt(duration) * 24 * 60 * 60 * 1000)
    
    const conflicts: string[] = []
    
    requests.forEach(req => {
      if (req.id === requestId || req.status === "rejected") return
      
      const reqDateTime = new Date(`${req.requestedDate}T${req.requestedTime}:00`)
      const reqEndTime = new Date(reqDateTime.getTime() + parseInt(req.duration) * 24 * 60 * 60 * 1000)
      
      // Check for overlap
      if ((requestDateTime >= reqDateTime && requestDateTime < reqEndTime) ||
          (requestEndTime > reqDateTime && requestEndTime <= reqEndTime) ||
          (requestDateTime <= reqDateTime && requestEndTime >= reqEndTime)) {
        conflicts.push(req.id)
      }
    })
    
    return conflicts
  }

  const approveRequest = (id: string) => {
    const request = requests.find(r => r.id === id)
    if (!request) return

    const conflicts = checkConflicts(id, request.requestedDate, request.requestedTime, request.duration)
    
    if (conflicts.length > 0) {
      toast.error("Cannot approve: Time slot conflicts with other approved requests")
      return
    }

    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: "approved" as const } : req
    ))
    
    toast.success("Custom schedule request approved! Queue will be reorganized.")
  }

  const rejectRequest = (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: "rejected" as const, rejectionReason } : req
    ))
    
    setSelectedRequest(null)
    setRejectionReason("")
    toast.success("Request rejected. Artist will be notified.")
  }

  const pendingRequests = requests.filter(r => r.status === "pending")
  const approvedRequests = requests.filter(r => r.status === "approved")
  const rejectedRequests = requests.filter(r => r.status === "rejected")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Custom Schedule Requests
          </CardTitle>
          <CardDescription>
            Manage artist requests for specific auction dates and times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-yellow-50 rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
              <div className="text-sm text-yellow-700">Pending Review</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{approvedRequests.length}</div>
              <div className="text-sm text-green-700">Approved</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border">
              <div className="text-2xl font-bold text-red-600">{rejectedRequests.length}</div>
              <div className="text-sm text-red-700">Rejected</div>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending custom schedule requests</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artwork</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Requested Slot</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Conflicts</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => {
                  const conflicts = checkConflicts(request.id, request.requestedDate, request.requestedTime, request.duration)
                  
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Image
                            src={request.imageUrl || "/placeholder.svg"}
                            alt={request.title}
                            width={60}
                            height={48}
                            className="rounded object-cover"
                          />
                          <div>
                            <div className="font-medium">{request.title}</div>
                            <div className="text-sm text-muted-foreground">{request.startingPrice} ETH</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{request.artist}</div>
                            <div className="text-xs text-muted-foreground">{request.artistWallet}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <div className="text-sm">
                            {formatDateTime(request.requestedDate, request.requestedTime)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.duration} days</Badge>
                      </TableCell>
                      <TableCell>
                        {conflicts.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600">{conflicts.length} conflicts</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">Available</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveRequest(request.id)}
                            disabled={conflicts.length > 0}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Custom Schedule Request</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting this scheduling request. The artist will be notified.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="reason">Rejection Reason</Label>
                                  <Textarea
                                    id="reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="e.g., Time slot conflicts with platform schedule, too close to other auctions, etc."
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => selectedRequest && rejectRequest(selectedRequest.id)}
                                >
                                  Reject Request
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approved Requests */}
      {approvedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Approved Custom Schedules</CardTitle>
            <CardDescription>
              These requests have been approved and are scheduled in the queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvedRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={request.imageUrl || "/placeholder.svg"}
                      alt={request.title}
                      width={60}
                      height={48}
                      className="rounded object-cover"
                    />
                    <div>
                      <div className="font-medium">{request.title}</div>
                      <div className="text-sm text-muted-foreground">by {request.artist}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatDateTime(request.requestedDate, request.requestedTime)}</div>
                    <div className="text-sm text-muted-foreground">{request.duration} days duration</div>
                  </div>
                  <Badge className="bg-green-500">Scheduled</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
