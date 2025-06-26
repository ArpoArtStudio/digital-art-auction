"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface QueueItem {
  id: string
  title: string
  artist: string
  type: 'basic' | 'custom'
  duration: number
  requestedDate?: Date
  status: 'scheduled' | 'pending' | 'confirmed' | 'paused' | 'interrupted'
  scheduledDate?: Date
  scheduledTime?: string
  priority: number
}

interface ConflictSolution {
  type: 'pause' | 'reschedule' | 'reject' | 'overlap'
  description: string
  affectedItems: string[]
  newSchedule?: Array<{
    itemId: string
    date: Date
    time: string
  }>
  pros: string[]
  cons: string[]
  recommendationScore: number
}

interface ConflictResolverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customRequest: QueueItem
  conflicts: QueueItem[]
  solutions: ConflictSolution[]
  onSolutionSelected: (solution: ConflictSolution) => void
}

export function ConflictResolverDialog({
  open,
  onOpenChange,
  customRequest,
  conflicts,
  solutions,
  onSolutionSelected
}: ConflictResolverDialogProps) {
  const [selectedSolution, setSelectedSolution] = useState<ConflictSolution | null>(null)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getSolutionColor = (type: ConflictSolution['type']) => {
    switch (type) {
      case 'pause': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'reschedule': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'reject': return 'bg-red-100 text-red-800 border-red-200'
      case 'overlap': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRecommendationBadge = (score: number) => {
    if (score >= 8) return <Badge className="bg-green-100 text-green-800">Highly Recommended</Badge>
    if (score >= 6) return <Badge className="bg-yellow-100 text-yellow-800">Recommended</Badge>
    if (score >= 4) return <Badge className="bg-orange-100 text-orange-800">Consider</Badge>
    return <Badge className="bg-red-100 text-red-800">Not Recommended</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Scheduling Conflict Detected
          </DialogTitle>
          <DialogDescription>
            The custom request conflicts with existing scheduled auctions. Please choose a resolution strategy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Custom Request Details */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Custom Request
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Title:</span> {customRequest.title}
              </div>
              <div>
                <span className="font-medium">Artist:</span> {customRequest.artist}
              </div>
              <div>
                <span className="font-medium">Requested Date:</span> {customRequest.requestedDate ? formatDate(customRequest.requestedDate) : 'N/A'}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {customRequest.duration} day{customRequest.duration > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Conflicting Items */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Conflicting Auctions ({conflicts.length})
            </h3>
            <div className="space-y-2">
              {conflicts.map((conflict) => (
                <div key={conflict.id} className="bg-white p-3 rounded border border-red-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{conflict.title}</div>
                      <div className="text-sm text-gray-600">by {conflict.artist}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {conflict.scheduledDate ? formatDate(conflict.scheduledDate) : 'TBD'} • {conflict.duration} day{conflict.duration > 1 ? 's' : ''}
                      </div>
                    </div>
                    <Badge variant={conflict.type === 'custom' ? 'default' : 'secondary'}>
                      {conflict.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Solutions */}
          <div>
            <h3 className="font-semibold mb-4">Resolution Options</h3>
            <div className="space-y-4">
              {solutions.map((solution, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedSolution === solution
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSolution(solution)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={getSolutionColor(solution.type)}>
                        {solution.type.charAt(0).toUpperCase() + solution.type.slice(1)}
                      </Badge>
                      {getRecommendationBadge(solution.recommendationScore)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Score: {solution.recommendationScore}/10
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{solution.description}</p>

                  {solution.newSchedule && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2">New Schedule:</h4>
                      <div className="space-y-1">
                        {solution.newSchedule.map((item, idx) => (
                          <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                            Item {item.itemId}: {formatDate(item.date)} at {item.time}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <h4 className="font-medium text-green-700 mb-1">Pros:</h4>
                      <ul className="list-disc list-inside space-y-0.5 text-green-600">
                        {solution.pros.map((pro, idx) => (
                          <li key={idx}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-700 mb-1">Cons:</h4>
                      <ul className="list-disc list-inside space-y-0.5 text-red-600">
                        {solution.cons.map((con, idx) => (
                          <li key={idx}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {solution.affectedItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Affected items:</span> {solution.affectedItems.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedSolution && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You've selected the <strong>{selectedSolution.type}</strong> strategy. This will affect {selectedSolution.affectedItems.length} auction{selectedSolution.affectedItems.length !== 1 ? 's' : ''}.
                {selectedSolution.type === 'pause' && ' The affected auctions will be paused and automatically resumed after the custom request completes.'}
                {selectedSolution.type === 'reschedule' && ' The affected auctions will be moved to new dates with appropriate spacing.'}
                {selectedSolution.type === 'reject' && ' The custom request will be declined and added to the regular queue.'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedSolution) {
                onSolutionSelected(selectedSolution)
                onOpenChange(false)
              }
            }}
            disabled={!selectedSolution}
          >
            Apply Solution
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
