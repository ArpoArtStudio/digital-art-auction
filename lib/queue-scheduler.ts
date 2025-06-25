/**
 * Advanced Queue Scheduling System
 * 
 * This system ensures that:
 * 1. Scheduled/approved pieces interrupt the basic queue
 * 2. Priority is given to scheduled slots
 * 3. No auctions overlap
 * 4. System handles gaps gracefully (even if no auctions for hours)
 */

import { addDays, addHours, isBefore, isAfter } from "date-fns"

export interface QueueItem {
  id: string
  title: string
  artist: string
  artistWallet: string
  imageUrl: string
  startingPrice: string
  category: string
  status: "pending" | "approved" | "rejected" | "removed"
  queuePosition: number | null
  submittedAt: string
  nftContract: string
  tokenId: string
  schedulingMode: "basic" | "custom"
  customDate?: string
  customTime?: string
  duration: string
  scheduledStartDate?: string
  scheduledEndDate?: string
  removalReason?: string
  priority?: "high" | "medium" | "low"
}

export interface SchedulingConflict {
  conflictingItemId: string
  conflictingItemTitle: string
  conflictType: "overlap" | "too_close"
  suggestedAlternatives: string[]
}

/**
 * Main scheduling algorithm that prioritizes scheduled slots
 */
export function reorganizeQueueWithPriority(items: QueueItem[]): QueueItem[] {
  const approvedItems = items.filter(item => item.status === "approved")
  
  // Separate items by scheduling type
  const customScheduled = approvedItems.filter(item => item.schedulingMode === "custom")
  const basicQueue = approvedItems.filter(item => item.schedulingMode === "basic")
  
  // Sort custom scheduled items by their scheduled date/time (HIGHEST PRIORITY)
  const sortedCustomScheduled = customScheduled.sort((a, b) => {
    const aTime = a.scheduledStartDate ? new Date(a.scheduledStartDate).getTime() : 0
    const bTime = b.scheduledStartDate ? new Date(b.scheduledStartDate).getTime() : 0
    return aTime - bTime
  })
  
  // Sort basic queue by priority (high > medium > low) then by submission date
  const sortedBasicQueue = basicQueue.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const aPriority = priorityOrder[a.priority || 'medium']
    const bPriority = priorityOrder[b.priority || 'medium']
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority // Higher priority first
    }
    
    // Same priority, sort by submission date
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  })
  
  // Build the final schedule
  const reorganized: QueueItem[] = []
  let currentDate = new Date()
  let position = 1
  
  // Create timeline with all scheduled items first
  const timeline = [...sortedCustomScheduled]
  
  // Insert basic queue items into available slots
  let basicIndex = 0
  let timelineIndex = 0
  
  while (basicIndex < sortedBasicQueue.length || timelineIndex < timeline.length) {
    const nextScheduledTime = timelineIndex < timeline.length && timeline[timelineIndex].scheduledStartDate
      ? new Date(timeline[timelineIndex].scheduledStartDate!).getTime()
      : Infinity
    
    // Calculate if we have time for a basic queue item before the next scheduled item
    const basicItemDuration = basicIndex < sortedBasicQueue.length 
      ? parseInt(sortedBasicQueue[basicIndex].duration) 
      : 0
    const basicItemEndTime = addDays(currentDate, basicItemDuration).getTime()
    
    // PRIORITY RULE: If a scheduled item is coming up, prioritize it
    if (timelineIndex < timeline.length && 
        (basicItemEndTime > nextScheduledTime || 
         currentDate.getTime() >= nextScheduledTime)) {
      
      // Add the scheduled item (HIGHEST PRIORITY)
      const scheduledItem = { ...timeline[timelineIndex] }
      scheduledItem.queuePosition = position
      
      reorganized.push(scheduledItem)
      currentDate = new Date(scheduledItem.scheduledEndDate!)
      timelineIndex++
      position++
      
    } else if (basicIndex < sortedBasicQueue.length) {
      // Add basic queue item if there's time before next scheduled item
      const basicItem = { ...sortedBasicQueue[basicIndex] }
      basicItem.queuePosition = position
      basicItem.scheduledStartDate = currentDate.toISOString()
      basicItem.scheduledEndDate = addDays(currentDate, parseInt(basicItem.duration)).toISOString()
      
      reorganized.push(basicItem)
      currentDate = addDays(currentDate, parseInt(basicItem.duration))
      basicIndex++
      position++
    }
  }
  
  // Add any remaining basic items after all scheduled items
  while (basicIndex < sortedBasicQueue.length) {
    const basicItem = { ...sortedBasicQueue[basicIndex] }
    basicItem.queuePosition = position
    basicItem.scheduledStartDate = currentDate.toISOString()
    basicItem.scheduledEndDate = addDays(currentDate, parseInt(basicItem.duration)).toISOString()
    
    reorganized.push(basicItem)
    currentDate = addDays(currentDate, parseInt(basicItem.duration))
    basicIndex++
    position++
  }
  
  // Return all items (reorganized + non-approved items unchanged)
  return [
    ...reorganized,
    ...items.filter(item => item.status !== "approved")
  ]
}

/**
 * Check for scheduling conflicts
 */
export function detectConflicts(
  requestedItem: QueueItem,
  existingItems: QueueItem[]
): SchedulingConflict[] {
  if (!requestedItem.scheduledStartDate || !requestedItem.scheduledEndDate) {
    return []
  }
  
  const conflicts: SchedulingConflict[] = []
  const requestStart = new Date(requestedItem.scheduledStartDate)
  const requestEnd = new Date(requestedItem.scheduledEndDate)
  
  for (const item of existingItems) {
    if (item.id === requestedItem.id || !item.scheduledStartDate || !item.scheduledEndDate) {
      continue
    }
    
    const itemStart = new Date(item.scheduledStartDate)
    const itemEnd = new Date(item.scheduledEndDate)
    
    // Check for overlap
    if ((requestStart < itemEnd && requestEnd > itemStart)) {
      conflicts.push({
        conflictingItemId: item.id,
        conflictingItemTitle: item.title,
        conflictType: "overlap",
        suggestedAlternatives: generateAlternativeTimes(requestedItem, existingItems)
      })
    }
    
    // Check if too close (less than 1 hour gap)
    const minGap = 60 * 60 * 1000 // 1 hour in milliseconds
    if ((Math.abs(requestStart.getTime() - itemEnd.getTime()) < minGap) ||
        (Math.abs(itemStart.getTime() - requestEnd.getTime()) < minGap)) {
      conflicts.push({
        conflictingItemId: item.id,
        conflictingItemTitle: item.title,
        conflictType: "too_close",
        suggestedAlternatives: generateAlternativeTimes(requestedItem, existingItems)
      })
    }
  }
  
  return conflicts
}

/**
 * Generate alternative time slots
 */
function generateAlternativeTimes(
  requestedItem: QueueItem,
  existingItems: QueueItem[]
): string[] {
  const alternatives: string[] = []
  const duration = parseInt(requestedItem.duration)
  let currentDate = new Date()
  
  // Look for slots over the next 30 days
  for (let day = 0; day < 30; day++) {
    for (let hour = 9; hour < 21; hour += 3) { // 9 AM to 9 PM, every 3 hours
      const slotStart = addHours(addDays(currentDate, day), hour)
      const slotEnd = addDays(slotStart, duration)
      
      // Check if this slot conflicts with existing items
      const hasConflict = existingItems.some(item => {
        if (!item.scheduledStartDate || !item.scheduledEndDate) return false
        
        const itemStart = new Date(item.scheduledStartDate)
        const itemEnd = new Date(item.scheduledEndDate)
        
        return (slotStart < itemEnd && slotEnd > itemStart)
      })
      
      if (!hasConflict) {
        alternatives.push(slotStart.toISOString())
        
        // Limit to 5 alternatives
        if (alternatives.length >= 5) {
          return alternatives
        }
      }
    }
  }
  
  return alternatives
}

/**
 * Calculate next available slot for basic queue items
 */
export function getNextAvailableSlot(
  existingItems: QueueItem[],
  duration: number = 7
): Date {
  const approvedItems = existingItems
    .filter(item => item.status === "approved" && item.scheduledEndDate)
    .sort((a, b) => {
      const aTime = new Date(a.scheduledEndDate!).getTime()
      const bTime = new Date(b.scheduledEndDate!).getTime()
      return aTime - bTime
    })
  
  let nextSlot = new Date()
  
  // Find the latest end time and add our duration
  if (approvedItems.length > 0) {
    const lastItem = approvedItems[approvedItems.length - 1]
    nextSlot = new Date(lastItem.scheduledEndDate!)
  }
  
  return nextSlot
}

/**
 * Emergency queue reorganization for when scheduled items need immediate priority
 */
export function emergencyReorganization(
  items: QueueItem[],
  urgentItemId: string
): QueueItem[] {
  const urgentItem = items.find(item => item.id === urgentItemId)
  if (!urgentItem) return items
  
  // Mark as high priority and reorganize
  urgentItem.priority = "high"
  return reorganizeQueueWithPriority(items)
}

/**
 * Validate scheduling request
 */
export function validateSchedulingRequest(item: QueueItem): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (item.schedulingMode === "custom") {
    if (!item.customDate) {
      errors.push("Custom date is required")
    }
    
    if (!item.customTime) {
      errors.push("Custom time is required")
    }
    
    if (item.customDate && item.customTime) {
      const requestedDateTime = new Date(`${item.customDate}T${item.customTime}:00`)
      
      if (requestedDateTime <= new Date()) {
        errors.push("Scheduled time must be in the future")
      }
      
      // Don't allow scheduling more than 90 days in advance
      const maxAdvance = addDays(new Date(), 90)
      if (requestedDateTime > maxAdvance) {
        errors.push("Cannot schedule more than 90 days in advance")
      }
    }
  }
  
  const durationNum = parseInt(item.duration)
  if (durationNum < 1 || durationNum > 14) {
    errors.push("Duration must be between 1 and 14 days")
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
