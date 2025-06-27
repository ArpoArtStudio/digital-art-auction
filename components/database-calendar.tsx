"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { DatabaseService } from '@/lib/database'
import { useWallet } from '@/contexts/wallet-context'
import { Calendar, Plus, Edit, Trash2, Clock, MapPin, Eye, EyeOff } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  event_type: string
  start_datetime: string
  end_datetime: string
  all_day: boolean
  artwork_id?: string
  color: string
  location?: string
  is_public: boolean
  is_cancelled: boolean
  created_at: string
}

export function DatabaseCalendar() {
  const { isAdmin, user } = useWallet()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState('auction')
  const [startDateTime, setStartDateTime] = useState('')
  const [endDateTime, setEndDateTime] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [color, setColor] = useState('#3B82F6')
  const [location, setLocation] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [currentDate])

  const loadEvents = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const events = await DatabaseService.getCalendarEvents({
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      })
      
      setEvents(events)
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setEventType('auction')
    setStartDateTime('')
    setEndDateTime('')
    setAllDay(false)
    setColor('#3B82F6')
    setLocation('')
    setIsPublic(true)
    setEditingEvent(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !isAdmin) return

    setIsLoading(true)
    try {
      const eventData = {
        title,
        description: description || undefined,
        event_type: eventType,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        all_day: allDay,
        created_by: user.wallet_address!,
        color,
        location: location || undefined,
        is_public: isPublic
      }

      if (editingEvent) {
        await DatabaseService.updateCalendarEvent(editingEvent.id, eventData)
      } else {
        await DatabaseService.createCalendarEvent(eventData)
      }

      await loadEvents()
      resetForm()
    } catch (error) {
      console.error('Failed to save event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event)
    setTitle(event.title)
    setDescription(event.description || '')
    setEventType(event.event_type)
    setStartDateTime(event.start_datetime.slice(0, 16)) // Format for datetime-local
    setEndDateTime(event.end_datetime.slice(0, 16))
    setAllDay(event.all_day)
    setColor(event.color)
    setLocation(event.location || '')
    setIsPublic(event.is_public)
    setShowForm(true)
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await DatabaseService.deleteCalendarEvent(eventId)
      await loadEvents()
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      auction: 'bg-blue-500',
      exhibition: 'bg-purple-500',
      maintenance: 'bg-red-500',
      promotion: 'bg-green-500',
      artist_spotlight: 'bg-yellow-500',
      admin_meeting: 'bg-gray-500',
      platform_update: 'bg-indigo-500'
    }
    return colors[type] || 'bg-blue-500'
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString()
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const getEventsForDay = (day: number) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime)
      return eventDate.toDateString() === dayDate.toDateString()
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Access denied. Only administrators can manage the calendar.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              ←
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              →
            </Button>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((day, index) => {
              if (day === null) {
                return <div key={index} className="p-2 h-24"></div>
              }
              
              const dayEvents = getEventsForDay(day)
              
              return (
                <div key={day} className="p-1 h-24 border border-border rounded-md">
                  <div className="text-sm font-medium mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded text-white truncate cursor-pointer"
                        style={{ backgroundColor: event.color }}
                        onClick={() => handleEdit(event)}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auction">Auction</SelectItem>
                        <SelectItem value="exhibition">Exhibition</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="artist_spotlight">Artist Spotlight</SelectItem>
                        <SelectItem value="admin_meeting">Admin Meeting</SelectItem>
                        <SelectItem value="platform_update">Platform Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Date & Time *</Label>
                    <Input
                      id="start-time"
                      type="datetime-local"
                      value={startDateTime}
                      onChange={(e) => setStartDateTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Date & Time *</Label>
                    <Input
                      id="end-time"
                      type="datetime-local"
                      value={endDateTime}
                      onChange={(e) => setEndDateTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-day"
                      checked={allDay}
                      onCheckedChange={setAllDay}
                    />
                    <Label htmlFor="all-day">All day event</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-public"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                    <Label htmlFor="is-public">Public event</Label>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  {editingEvent && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleDelete(editingEvent.id)}
                    >
                      Delete
                    </Button>
                  )}
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : editingEvent ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event List */}
      <Card>
        <CardHeader>
          <CardTitle>Events This Month</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No events scheduled for this month
            </div>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(event.start_datetime)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                        <Badge variant="outline">
                          {event.event_type.replace('_', ' ')}
                        </Badge>
                        {event.is_public ? (
                          <Eye className="h-3 w-3 text-green-500" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
