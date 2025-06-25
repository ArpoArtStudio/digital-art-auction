"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, User, Mail, Image as ImageIcon, ChevronLeft, ChevronRight, Edit3, Trash2, Check, X } from "lucide-react"

interface AuctionSlot {
  id: string
  date: string
  time: string
  duration: string
  title: string
  artist: string
  email?: string
  status: "scheduled" | "pending" | "confirmed" | "cancelled"
  type: "standard" | "custom"
  priority: number
  submissionDate: string
}

interface AdminCalendarProps {
  onSlotUpdate?: (slot: AuctionSlot) => void
  onSlotDelete?: (slotId: string) => void
}

export function AdminCalendar({ onSlotUpdate, onSlotDelete }: AdminCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [auctionSlots, setAuctionSlots] = useState<AuctionSlot[]>([
    // Mock data for demonstration
    {
      id: "1",
      date: "2025-06-26",
      time: "14:00",
      duration: "1",
      title: "Digital Dreams #1",
      artist: "artist.eth",
      email: "artist@example.com",
      status: "scheduled",
      type: "standard",
      priority: 1,
      submissionDate: "2025-06-25T10:00:00Z"
    },
    {
      id: "2",
      date: "2025-06-27",
      time: "16:30",
      duration: "2",
      title: "Cyber Landscape",
      artist: "creator.eth",
      email: "creator@example.com",
      status: "pending",
      type: "custom",
      priority: 0,
      submissionDate: "2025-06-25T12:00:00Z"
    },
    {
      id: "3",
      date: "2025-06-28",
      time: "12:00",
      duration: "1",
      title: "Abstract Emotions",
      artist: "artist2.eth",
      status: "confirmed",
      type: "standard",
      priority: 2,
      submissionDate: "2025-06-24T15:00:00Z"
    }
  ])
  const [editingSlot, setEditingSlot] = useState<AuctionSlot | null>(null)
  const [conflictResolution, setConflictResolution] = useState<{
    slot: AuctionSlot
    conflicts: AuctionSlot[]
  } | null>(null)

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }

  const getSlotsByDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return auctionSlots.filter(slot => slot.date === dateStr)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "confirmed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    return type === "custom" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
  }

  const handleSlotEdit = (slot: AuctionSlot) => {
    setEditingSlot({ ...slot })
  }

  const handleSlotSave = () => {
    if (!editingSlot) return

    // Check for conflicts
    const conflicts = auctionSlots.filter(slot => 
      slot.id !== editingSlot.id && 
      slot.date === editingSlot.date &&
      Math.abs(
        new Date(`${slot.date}T${slot.time}`).getTime() - 
        new Date(`${editingSlot.date}T${editingSlot.time}`).getTime()
      ) < (24 * 60 * 60 * 1000) // Within 24 hours
    )

    if (conflicts.length > 0) {
      setConflictResolution({ slot: editingSlot, conflicts })
      return
    }

    setAuctionSlots(prev => 
      prev.map(slot => slot.id === editingSlot.id ? editingSlot : slot)
    )
    setEditingSlot(null)
    onSlotUpdate?.(editingSlot)
  }

  const handleSlotDelete = (slotId: string) => {
    setAuctionSlots(prev => prev.filter(slot => slot.id !== slotId))
    onSlotDelete?.(slotId)
  }

  const handleStatusChange = (slotId: string, newStatus: string) => {
    setAuctionSlots(prev => 
      prev.map(slot => 
        slot.id === slotId 
          ? { ...slot, status: newStatus as AuctionSlot['status'] }
          : slot
      )
    )
  }

  const resolveConflict = (action: "reschedule" | "override") => {
    if (!conflictResolution) return

    if (action === "override") {
      // Force the change, potentially moving conflicting auctions
      setAuctionSlots(prev => 
        prev.map(slot => slot.id === conflictResolution.slot.id ? conflictResolution.slot : slot)
      )
    }

    setConflictResolution(null)
    setEditingSlot(null)
  }

  const calendarDays = generateCalendarDays()
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Auction Schedule Calendar
          </CardTitle>
          <CardDescription>
            Manage auction slots, resolve conflicts, and view the complete schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const isToday = day.toDateString() === new Date().toDateString()
              const slots = getSlotsByDate(day)
              const dateStr = day.toISOString().split('T')[0]
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[80px] p-1 border rounded cursor-pointer transition-colors
                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                    ${selectedDate === dateStr ? 'bg-blue-50' : ''}
                    hover:bg-gray-50
                  `}
                  onClick={() => setSelectedDate(selectedDate === dateStr ? "" : dateStr)}
                >
                  <div className={`text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {slots.slice(0, 2).map(slot => (
                      <div
                        key={slot.id}
                        className={`text-xs p-1 rounded ${getStatusColor(slot.status)} truncate`}
                        title={`${slot.title} - ${slot.time}`}
                      >
                        {slot.time}
                      </div>
                    ))}
                    {slots.length > 2 && (
                      <div className="text-xs text-gray-500">+{slots.length - 2} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Auctions for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            {auctionSlots
              .filter(slot => slot.date === selectedDate)
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(slot => (
                <div key={slot.id} className="border rounded-lg p-4 mb-4 last:mb-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{slot.title}</h4>
                        <Badge className={getStatusColor(slot.status)}>
                          {slot.status}
                        </Badge>
                        <Badge className={getTypeColor(slot.type)}>
                          {slot.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {slot.time} ({slot.duration} day{slot.duration !== "1" ? "s" : ""})
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {slot.artist}
                        </div>
                        {slot.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {slot.email}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Select 
                          value={slot.status} 
                          onValueChange={(value) => handleStatusChange(slot.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSlotEdit(slot)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSlotDelete(slot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            
            {auctionSlots.filter(slot => slot.date === selectedDate).length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No auctions scheduled for this date
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Slot Dialog */}
      {editingSlot && (
        <Dialog open={!!editingSlot} onOpenChange={(open) => !open && setEditingSlot(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Auction Slot</DialogTitle>
              <DialogDescription>
                Modify the auction details. Changes may affect the schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingSlot.date}
                    onChange={(e) => setEditingSlot(prev => prev ? { ...prev, date: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Time</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editingSlot.time}
                    onChange={(e) => setEditingSlot(prev => prev ? { ...prev, time: e.target.value } : null)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration</Label>
                  <Select 
                    value={editingSlot.duration} 
                    onValueChange={(value) => setEditingSlot(prev => prev ? { ...prev, duration: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editingSlot.status} 
                    onValueChange={(value) => setEditingSlot(prev => prev ? { ...prev, status: value as AuctionSlot['status'] } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingSlot(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSlotSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Conflict Resolution Dialog */}
      {conflictResolution && (
        <Dialog open={!!conflictResolution} onOpenChange={(open) => !open && setConflictResolution(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Conflict Detected</DialogTitle>
              <DialogDescription>
                The requested time conflicts with existing auctions. How would you like to proceed?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Conflicting auctions:</strong>
                  <ul className="mt-2 space-y-1">
                    {conflictResolution.conflicts.map(conflict => (
                      <li key={conflict.id}>
                        • {conflict.title} at {conflict.time} ({conflict.duration} day{conflict.duration !== "1" ? "s" : ""})
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => resolveConflict("reschedule")}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Change
                </Button>
                <Button onClick={() => resolveConflict("override")}>
                  <Check className="h-4 w-4 mr-2" />
                  Force Schedule (Override Conflicts)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
              <span className="text-sm">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></div>
              <span className="text-sm">Pending Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
              <span className="text-sm">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
              <span className="text-sm">Cancelled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></div>
              <span className="text-sm">Custom Request</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
              <span className="text-sm">Standard Queue</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
