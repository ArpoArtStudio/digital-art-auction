"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  AlertTriangle,
  Star,
  Play,
  Pause,
  RotateCcw
} from "lucide-react"

interface AuctionSlot {
  id: string
  date: string
  time: string
  duration: string
  title: string
  artist: string
  email?: string
  status: "scheduled" | "pending" | "confirmed" | "cancelled" | "paused" | "interrupted"
  type: "standard" | "custom"
  priority: number
  submissionDate: string
  startingPrice?: string
  category?: string
  endDate?: string // Calculated end date
  endTime?: string // Calculated end time
  interruptedBy?: string // ID of the auction that interrupted this one
  originalSchedule?: { // Store original schedule if interrupted
    date: string
    time: string
  }
}

interface SchedulingConflict {
  type: "overlap" | "gap" | "duration_conflict"
  conflictingAuctions: AuctionSlot[]
  suggestedSolutions: string[]
}

interface LargeCalendarProps {
  onSlotUpdate?: (slot: AuctionSlot) => void
  onSlotDelete?: (slotId: string) => void
  onConflictResolution?: (resolution: any) => void
}

export function LargeCalendar({ onSlotUpdate, onSlotDelete, onConflictResolution }: LargeCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [viewMode, setViewMode] = useState<"month" | "week">("month")
  const [auctionSlots, setAuctionSlots] = useState<AuctionSlot[]>([
    // Mock data with realistic scenarios
    {
      id: "1",
      date: "2025-06-27",
      time: "14:00",
      duration: "2", // 2-day auction
      title: "Digital Dreams Collection",
      artist: "artist.eth",
      email: "artist@example.com",
      status: "scheduled",
      type: "standard",
      priority: 1,
      submissionDate: "2025-06-25T10:00:00Z",
      startingPrice: "0.5",
      category: "digital-art",
      endDate: "2025-06-29",
      endTime: "14:00"
    },
    {
      id: "2",
      date: "2025-06-28",
      time: "16:30",
      duration: "1",
      title: "Cyber Landscape (CUSTOM REQUEST)",
      artist: "creator.eth",
      email: "creator@example.com",
      status: "pending",
      type: "custom",
      priority: 0, // Highest priority
      submissionDate: "2025-06-25T12:00:00Z",
      startingPrice: "0.25",
      category: "3d-art",
      endDate: "2025-06-29",
      endTime: "16:30"
    },
    {
      id: "3",
      date: "2025-06-30",
      time: "12:00",
      duration: "1",
      title: "Abstract Emotions",
      artist: "artist2.eth",
      status: "confirmed",
      type: "standard",
      priority: 2,
      submissionDate: "2025-06-24T15:00:00Z",
      startingPrice: "0.15",
      category: "abstract",
      endDate: "2025-07-01",
      endTime: "12:00"
    }
  ])

  const [selectedSlots, setSelectedSlots] = useState<AuctionSlot[]>([])
  const [conflicts, setConflicts] = useState<SchedulingConflict[]>([])
  const [showConflictResolver, setShowConflictResolver] = useState(false)
  const [editingSlot, setEditingSlot] = useState<AuctionSlot | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null)

  // Calculate end dates and detect conflicts
  useEffect(() => {
    const updatedSlots = auctionSlots.map(slot => {
      const startDate = new Date(`${slot.date}T${slot.time}`)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + parseInt(slot.duration))
      
      return {
        ...slot,
        endDate: endDate.toISOString().split('T')[0],
        endTime: slot.time
      }
    })
    
    // Detect conflicts
    const detectedConflicts = detectSchedulingConflicts(updatedSlots)
    setConflicts(detectedConflicts)
    
    if (updatedSlots !== auctionSlots) {
      setAuctionSlots(updatedSlots)
    }
  }, [auctionSlots.length])

  // Smart scheduling conflict detection
  const detectSchedulingConflicts = (slots: AuctionSlot[]): SchedulingConflict[] => {
    const conflicts: SchedulingConflict[] = []
    
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1 = slots[i]
        const slot2 = slots[j]
        
        const start1 = new Date(`${slot1.date}T${slot1.time}`)
        const end1 = new Date(`${slot1.endDate}T${slot1.endTime}`)
        const start2 = new Date(`${slot2.date}T${slot2.time}`)
        const end2 = new Date(`${slot2.endDate}T${slot2.endTime}`)
        
        // Check for overlaps
        if ((start1 < end2 && end1 > start2) || (start2 < end1 && end2 > start1)) {
          conflicts.push({
            type: "overlap",
            conflictingAuctions: [slot1, slot2],
            suggestedSolutions: generateConflictSolutions(slot1, slot2)
          })
        }
      }
    }
    
    return conflicts
  }

  // Generate smart solutions for scheduling conflicts
  const generateConflictSolutions = (slot1: AuctionSlot, slot2: AuctionSlot): string[] => {
    const solutions: string[] = []
    
    // Priority-based solutions
    if (slot1.type === "custom" && slot2.type === "standard") {
      solutions.push(`Pause "${slot2.title}" and reschedule after custom auction`)
      solutions.push(`Shorten "${slot2.title}" duration to fit before custom slot`)
      solutions.push(`Move "${slot2.title}" to next available slot`)
    } else if (slot2.type === "custom" && slot1.type === "standard") {
      solutions.push(`Pause "${slot1.title}" and reschedule after custom auction`)
      solutions.push(`Shorten "${slot1.title}" duration to fit before custom slot`)
      solutions.push(`Move "${slot1.title}" to next available slot`)
    } else if (slot1.type === "custom" && slot2.type === "custom") {
      solutions.push("Contact both artists to negotiate timing")
      solutions.push("Offer alternative premium time slots")
      solutions.push("First-come-first-served priority (based on submission date)")
    } else {
      // Both standard auctions
      solutions.push("Reschedule later auction to next available slot")
      solutions.push("Shorten duration of one auction")
      solutions.push("Create back-to-back schedule with no gap")
    }
    
    return solutions
  }

  // Smart queue interrupt logic
  const handleCustomSchedulingRequest = (customSlot: AuctionSlot) => {
    const conflictingSlots = auctionSlots.filter(slot => {
      const customStart = new Date(`${customSlot.date}T${customSlot.time}`)
      const customEnd = new Date(customStart)
      customEnd.setDate(customEnd.getDate() + parseInt(customSlot.duration))
      
      const slotStart = new Date(`${slot.date}T${slot.time}`)
      const slotEnd = new Date(`${slot.endDate}T${slot.endTime}`)
      
      return (customStart < slotEnd && customEnd > slotStart)
    })
    
    if (conflictingSlots.length > 0) {
      // Apply interrupt logic
      const updatedSlots = auctionSlots.map(slot => {
        if (conflictingSlots.includes(slot)) {
          if (slot.type === "standard") {
            // Pause standard auction for custom request
            return {
              ...slot,
              status: "paused" as const,
              interruptedBy: customSlot.id,
              originalSchedule: {
                date: slot.date,
                time: slot.time
              }
            }
          }
        }
        return slot
      })
      
      setAuctionSlots([...updatedSlots, customSlot])
      
      // Find new slot for interrupted auctions
      rescheduleInterruptedAuctions(conflictingSlots, customSlot)
    } else {
      // No conflicts, add directly
      setAuctionSlots([...auctionSlots, customSlot])
    }
  }

  // Reschedule interrupted auctions
  const rescheduleInterruptedAuctions = (interruptedSlots: AuctionSlot[], customSlot: AuctionSlot) => {
    const customEnd = new Date(`${customSlot.date}T${customSlot.time}`)
    customEnd.setDate(customEnd.getDate() + parseInt(customSlot.duration))
    
    interruptedSlots.forEach(slot => {
      // Find next available slot after custom auction ends
      const newDate = new Date(customEnd)
      newDate.setDate(newDate.getDate() + 1) // Add 1 day buffer
      
      const updatedSlot = {
        ...slot,
        date: newDate.toISOString().split('T')[0],
        time: slot.time,
        status: "scheduled" as const
      }
      
      // Update the slot
      setAuctionSlots(prev => 
        prev.map(s => s.id === slot.id ? updatedSlot : s)
      )
    })
  }

  // Generate calendar days for current month/week
  const generateCalendarDays = () => {
    if (viewMode === "week") {
      const days = []
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        days.push(date)
      }
      return days
    } else {
      // Month view
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
  }

  const getSlotsByDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return auctionSlots.filter(slot => {
      // Check if auction starts on this date OR is running on this date
      const slotStart = new Date(`${slot.date}T${slot.time}`)
      const slotEnd = new Date(`${slot.endDate}T${slot.endTime}`)
      const checkDate = new Date(dateStr)
      
      return checkDate >= slotStart && checkDate <= slotEnd
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed": return "bg-green-100 text-green-800 border-green-200"
      case "cancelled": return "bg-red-100 text-red-800 border-red-200"
      case "paused": return "bg-orange-100 text-orange-800 border-orange-200"
      case "interrupted": return "bg-purple-100 text-purple-800 border-purple-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    return type === "custom" ? "bg-purple-100 text-purple-800 border-purple-200" : "bg-gray-100 text-gray-800 border-gray-200"
  }

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    setSelectedDate(selectedDate === dateStr ? "" : dateStr)
    setSelectedSlots(getSlotsByDate(date))
  }

  const calendarDays = generateCalendarDays()
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Helper function to render interruption analysis
  const renderInterruptionAnalysis = (slot: AuctionSlot) => {
    const conflictingStandardSlots = auctionSlots.filter(s => {
      if (s.type === "standard" && s.id !== slot.id) {
        const customStart = new Date(`${slot.date}T${slot.time}`)
        const customEnd = new Date(customStart)
        customEnd.setDate(customEnd.getDate() + parseInt(slot.duration))
        
        const standardStart = new Date(`${s.date}T${s.time}`)
        const standardEnd = new Date(`${s.endDate}T${s.endTime}`)
        
        return (customStart < standardEnd && customEnd > standardStart)
      }
      return false
    })

    if (conflictingStandardSlots.length === 0) {
      return (
        <div className="text-green-700">
          ✅ No conflicts - This custom request can be scheduled without interrupting any standard auctions.
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <div className="text-purple-800 font-medium">
          ⚠️ This custom request will interrupt {conflictingStandardSlots.length} standard auction{conflictingStandardSlots.length > 1 ? "s" : ""}:
        </div>
        {conflictingStandardSlots.map(conflictSlot => (
          <div key={conflictSlot.id} className="bg-white p-3 rounded border">
            <div className="font-medium">{conflictSlot.title}</div>
            <div className="text-sm text-gray-600">
              {conflictSlot.duration} day auction • {conflictSlot.artist}
            </div>
            <div className="text-sm mt-1">
              <strong>Recommended Action:</strong> 
              {parseInt(conflictSlot.duration) > 1 
                ? " Pause this auction and reschedule after custom request"
                : " Move to next available 1-day slot"
              }
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Handler functions for slot management
  const handleEditSlot = (slot: AuctionSlot) => {
    setEditingSlot({ ...slot })
    setShowEditDialog(true)
  }

  const handleDeleteSlot = (slotId: string) => {
    setDeletingSlotId(slotId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteSlot = () => {
    if (deletingSlotId) {
      setAuctionSlots(prev => prev.filter(slot => slot.id !== deletingSlotId))
      if (onSlotDelete) onSlotDelete(deletingSlotId)
      
      // Update selected slots if the deleted slot was selected
      setSelectedSlots(prev => prev.filter(slot => slot.id !== deletingSlotId))
    }
    setShowDeleteDialog(false)
    setDeletingSlotId(null)
  }

  const handleSaveEdit = () => {
    if (editingSlot) {
      // Validate the slot
      const validationErrors = validateSlot(editingSlot)
      if (validationErrors.length > 0) {
        alert(`Please fix the following errors:\n${validationErrors.join('\n')}`)
        return
      }
      
      setAuctionSlots(prev => 
        prev.map(slot => 
          slot.id === editingSlot.id ? editingSlot : slot
        )
      )
      
      // Update selected slots if the edited slot was selected
      setSelectedSlots(prev => 
        prev.map(slot => 
          slot.id === editingSlot.id ? editingSlot : slot
        )
      )
      
      if (onSlotUpdate) onSlotUpdate(editingSlot)
      
      // Show success message
      console.log(`Auction "${editingSlot.title}" updated successfully`)
    }
    setShowEditDialog(false)
    setEditingSlot(null)
  }

  const handleEditChange = (field: keyof AuctionSlot, value: any) => {
    if (editingSlot) {
      const updatedSlot = { ...editingSlot, [field]: value }
      
      // Recalculate end date and time when date, time, or duration changes
      if (field === 'date' || field === 'time' || field === 'duration') {
        const startDate = new Date(`${updatedSlot.date}T${updatedSlot.time}`)
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + parseInt(updatedSlot.duration))
        
        updatedSlot.endDate = endDate.toISOString().split('T')[0]
        updatedSlot.endTime = updatedSlot.time
      }
      
      // Update priority based on type
      if (field === 'type') {
        updatedSlot.priority = value === 'custom' ? 0 : 1
      }
      
      setEditingSlot(updatedSlot)
    }
  }

  // Helper function to get slot by ID
  const getSlotById = (slotId: string): AuctionSlot | undefined => {
    return auctionSlots.find(slot => slot.id === slotId)
  }

  // Helper function to format date for display
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Helper function to validate auction slot
  const validateSlot = (slot: AuctionSlot): string[] => {
    const errors: string[] = []
    
    if (!slot.title.trim()) errors.push("Title is required")
    if (!slot.artist.trim()) errors.push("Artist name is required")
    if (!slot.date) errors.push("Start date is required")
    if (!slot.time) errors.push("Start time is required")
    if (!slot.duration) errors.push("Duration is required")
    
    if (slot.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(slot.email)) {
      errors.push("Invalid email format")
    }
    
    if (slot.startingPrice && (isNaN(parseFloat(slot.startingPrice)) || parseFloat(slot.startingPrice) < 0)) {
      errors.push("Starting price must be a valid number")
    }
    
    return errors
  }

  const handleResumeAuction = (slotId: string) => {
    setAuctionSlots(prev => 
      prev.map(slot => 
        slot.id === slotId 
          ? { 
              ...slot, 
              status: "scheduled" as const,
              interruptedBy: undefined // Clear interruption when resuming
            }
          : slot
      )
    )
    
    // Update selected slots if the resumed slot was selected
    setSelectedSlots(prev => 
      prev.map(slot => 
        slot.id === slotId 
          ? { 
              ...slot, 
              status: "scheduled" as const,
              interruptedBy: undefined
            }
          : slot
      )
    )
  }

  const handleRestoreOriginalSchedule = (slotId: string) => {
    setAuctionSlots(prev => 
      prev.map(slot => {
        if (slot.id === slotId && slot.originalSchedule) {
          return {
            ...slot,
            date: slot.originalSchedule.date,
            time: slot.originalSchedule.time,
            status: "scheduled" as const,
            originalSchedule: undefined,
            interruptedBy: undefined
          }
        }
        return slot
      })
    )
  }

  return (
    <div className="space-y-8">
      {/* Conflict Alerts */}
      {conflicts.length > 0 && (
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg">Scheduling Conflicts Detected!</AlertTitle>
          <AlertDescription className="text-base">
            {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""} found. Click "Resolve Conflicts" to view smart solutions.
            <Button 
              className="ml-4" 
              size="default" 
              onClick={() => setShowConflictResolver(true)}
            >
              Resolve Conflicts
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Calendar Controls */}
      <div className="flex items-center justify-between bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const newDate = new Date(currentDate)
              if (viewMode === "week") {
                newDate.setDate(newDate.getDate() - 7)
              } else {
                newDate.setMonth(newDate.getMonth() - 1)
              }
              setCurrentDate(newDate)
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <h2 className="text-3xl font-bold min-w-[300px] text-center">
            {viewMode === "week"
              ? `Week of ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
              : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            }
          </h2>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const newDate = new Date(currentDate)
              if (viewMode === "week") {
                newDate.setDate(newDate.getDate() + 7)
              } else {
                newDate.setMonth(newDate.getMonth() + 1)
              }
              setCurrentDate(newDate)
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="lg"
            onClick={() => setViewMode("month")}
          >
            Month View
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="lg"
            onClick={() => setViewMode("week")}
          >
            Week View
          </Button>
        </div>
      </div>

      {/* Large Calendar Grid */}
      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-100 border-b-2 border-gray-200">
          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
            <div key={day} className="p-4 text-center font-bold text-lg text-gray-700 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = viewMode === "week" || day.getMonth() === currentDate.getMonth()
            const isToday = day.toDateString() === new Date().toDateString()
            const slots = getSlotsByDate(day)
            const dateStr = day.toISOString().split('T')[0]
            const hasConflicts = conflicts.some(conflict => 
              conflict.conflictingAuctions.some(slot => slot.date === dateStr)
            )
            
            return (
              <div
                key={index}
                className={`
                  min-h-[180px] p-4 border-b border-r border-gray-200 last:border-r-0 cursor-pointer 
                  transition-all duration-200 hover:bg-blue-50 hover:shadow-lg
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${isToday ? 'bg-blue-100 ring-2 ring-blue-500' : ''}
                  ${selectedDate === dateStr ? 'bg-blue-200 ring-2 ring-blue-600' : ''}
                  ${hasConflicts ? 'bg-red-50 ring-2 ring-red-400' : ''}
                `}
                onClick={() => handleDateClick(day)}
              >
                <div className={`text-xl font-bold mb-3 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                  {day.getDate()}
                  {isToday && <span className="ml-2 text-blue-600">(Today)</span>}
                </div>
                
                <div className="space-y-2">
                  {slots.slice(0, 4).map(slot => {
                    const isRunning = slot.date !== dateStr // Multi-day auction running on this date
                    return (
                      <div
                        key={slot.id}
                        className={`text-sm p-2 rounded-lg border-2 ${getStatusColor(slot.status)} transition-all hover:scale-105`}
                        title={`${slot.title} - ${slot.time} (${slot.duration} day${slot.duration !== "1" ? "s" : ""})`}
                      >
                        <div className="flex items-center gap-2">
                          {slot.type === "custom" && <Star className="h-4 w-4 text-purple-600" />}
                          {slot.status === "paused" && <Pause className="h-4 w-4 text-orange-600" />}
                          {isRunning && <Play className="h-4 w-4 text-green-600" />}
                          <span className="font-medium truncate">
                            {isRunning ? `[Running] ${slot.title}` : `${slot.time} ${slot.title}`}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {slot.artist} • {slot.duration} day{slot.duration !== "1" ? "s" : ""}
                        </div>
                      </div>
                    )
                  })}
                  {slots.length > 4 && (
                    <div className="text-sm text-gray-600 font-medium p-2 bg-gray-100 rounded text-center">
                      +{slots.length - 4} more auctions (click to view all)
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && selectedSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Auctions for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
            <CardDescription>
              {selectedSlots.length} auction{selectedSlots.length > 1 ? "s" : ""} scheduled for this date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedSlots
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(slot => (
                  <div key={slot.id} className={`border-2 rounded-lg p-4 ${getStatusColor(slot.status)}`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{slot.title}</h4>
                          <Badge className={getStatusColor(slot.status)}>
                            {slot.status}
                          </Badge>
                          <Badge className={getTypeColor(slot.type)}>
                            {slot.type === "custom" ? "Priority Request" : "Standard Queue"}
                          </Badge>
                          {slot.interruptedBy && (
                            <Badge className="bg-orange-100 text-orange-800">
                              Interrupted
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {slot.time} - {slot.endTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {slot.duration} day{slot.duration !== "1" ? "s" : ""}
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

                        {slot.interruptedBy && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              This auction was interrupted by a custom scheduling request. 
                              {slot.originalSchedule && (
                                <> Original schedule: {slot.originalSchedule.date} at {slot.originalSchedule.time}</>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleEditSlot(slot)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        {slot.status === "paused" && (
                          <Button variant="outline" size="sm" onClick={() => handleResumeAuction(slot.id)}>
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleDeleteSlot(slot.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Interruption Analysis */}
                    {slot.type === "custom" && slot.status === "pending" && (
                      <div className="mt-4">
                        <div className="font-medium text-gray-800">
                          Interruption Analysis:
                        </div>
                        {renderInterruptionAnalysis(slot)}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar Legend & Smart Scheduling Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Status Colors:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                  <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
                  <span>Cancelled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></div>
                  <span>Paused</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></div>
                  <span>Custom Priority</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Smart Scheduling Rules:</h3>
              <ul className="text-sm space-y-1">
                <li>• <strong>Custom requests</strong> always interrupt standard queue</li>
                <li>• <strong>2+ day auctions</strong> can be paused for custom slots</li>
                <li>• <strong>Interrupted auctions</strong> auto-reschedule after custom ends</li>
                <li>• <strong>Conflicts</strong> trigger automatic resolution suggestions</li>
                <li>• <strong>Email notifications</strong> sent for all schedule changes</li>
                <li>• <strong>1-day buffer</strong> added between rescheduled auctions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Interruption Logic Panel */}
      <Card className="border-2 border-green-300">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Smart Interruption Logic Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">🔥 Custom Request Priority</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✅</span>
                  <span><strong>1 Day Custom vs 2+ Day Standard:</strong> Pause long auction, run custom, resume after</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span><strong>2+ Day Custom vs 2+ Day Standard:</strong> Negotiate timing with artists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">ℹ️</span>
                  <span><strong>Custom vs Custom:</strong> First-come-first-served by submission date</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">📋 Standard Queue Logic</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✅</span>
                  <span><strong>Max 2-Hour Buffer:</strong> Between consecutive auctions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span><strong>3+ Day Auctions:</strong> Only if 7+ day gap until next custom request</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">ℹ️</span>
                  <span><strong>Weekend Priority:</strong> 1-day auctions preferred for Fri-Sun slots</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Auction Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Edit Auction Slot
            </DialogTitle>
            <DialogDescription>
              Modify the auction details. Changes will be applied immediately.
            </DialogDescription>
          </DialogHeader>
          
          {editingSlot && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Auction Title</Label>
                  <Input
                    id="edit-title"
                    value={editingSlot.title}
                    onChange={(e) => handleEditChange('title', e.target.value)}
                    placeholder="Enter auction title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-artist">Artist</Label>
                  <Input
                    id="edit-artist"
                    value={editingSlot.artist}
                    onChange={(e) => handleEditChange('artist', e.target.value)}
                    placeholder="Enter artist name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Start Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingSlot.date}
                    onChange={(e) => handleEditChange('date', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Start Time</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editingSlot.time}
                    onChange={(e) => handleEditChange('time', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration</Label>
                  <Select 
                    value={editingSlot.duration} 
                    onValueChange={(value) => handleEditChange('duration', value)}
                  >
                    <SelectTrigger id="edit-duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day (Recommended)</SelectItem>
                      <SelectItem value="2">2 Days</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editingSlot.status} 
                    onValueChange={(value) => handleEditChange('status', value)}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select 
                    value={editingSlot.type} 
                    onValueChange={(value) => handleEditChange('type', value)}
                  >
                    <SelectTrigger id="edit-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Queue</SelectItem>
                      <SelectItem value="custom">Custom Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email (Optional)</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingSlot.email || ''}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    placeholder="artist@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-starting-price">Starting Price (ETH)</Label>
                <Input
                  id="edit-starting-price"
                  value={editingSlot.startingPrice || ''}
                  onChange={(e) => handleEditChange('startingPrice', e.target.value)}
                  placeholder="0.1"
                />
              </div>
              
              {editingSlot.type === "custom" && (
                <Alert>
                  <Star className="h-4 w-4" />
                  <AlertTitle>Priority Request</AlertTitle>
                  <AlertDescription>
                    This is a custom priority request that can interrupt standard queue auctions.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Auction Slot
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this auction slot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deletingSlotId && (
            <div className="space-y-4">
              {(() => {
                const slotToDelete = auctionSlots.find(slot => slot.id === deletingSlotId)
                return slotToDelete ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800">{slotToDelete.title}</h4>
                    <div className="text-sm text-red-600 mt-1">
                      {slotToDelete.artist} • {slotToDelete.date} at {slotToDelete.time} • {slotToDelete.duration} day{slotToDelete.duration !== "1" ? "s" : ""}
                    </div>
                    <div className="mt-2">
                      <Badge className={`${getStatusColor(slotToDelete.status)} text-xs`}>
                        {slotToDelete.status.toUpperCase()}
                      </Badge>
                      <Badge className={`${getTypeColor(slotToDelete.type)} text-xs ml-2`}>
                        {slotToDelete.type === "custom" ? "Priority Request" : "Standard Queue"}
                      </Badge>
                    </div>
                  </div>
                ) : null
              })()}
              
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Deleting this auction slot will permanently remove it from the schedule. 
                  If this auction is currently running or has bids, consider pausing or cancelling instead.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDeleteSlot}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Permanently
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
