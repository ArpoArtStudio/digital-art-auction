"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/contexts/wallet-context"
import { toast } from "sonner"
import { Clock, Check, X, User } from "lucide-react"

interface UsernameChangeRequest {
  walletAddress: string
  currentName: string
  requestedName: string
  requestedAt: number
  approved: boolean
}

export function UsernameManagement() {
  const { isAdmin, pendingUsernameRequests, approveUsernameChange, rejectUsernameChange } = useWallet()
  const [requests, setRequests] = useState<UsernameChangeRequest[]>([])

  useEffect(() => {
    if (isAdmin) {
      // Load pending requests from localStorage
      const pendingRequestsJson = localStorage.getItem('pendingUsernameRequests')
      if (pendingRequestsJson) {
        try {
          const pendingRequests = JSON.parse(pendingRequestsJson)
          setRequests(pendingRequests.filter((req: UsernameChangeRequest) => !req.approved))
        } catch (error) {
          console.error("Error loading pending username requests:", error)
        }
      }
    }
  }, [isAdmin, pendingUsernameRequests])

  const handleApprove = async (walletAddress: string) => {
    try {
      approveUsernameChange(walletAddress)
      
      // Update local state
      setRequests(prev => prev.filter(req => req.walletAddress !== walletAddress))
      
      toast.success("Username change approved")
    } catch (error) {
      console.error("Error approving username change:", error)
      toast.error("Failed to approve username change")
    }
  }

  const handleReject = async (walletAddress: string) => {
    try {
      rejectUsernameChange(walletAddress)
      
      // Update local state
      setRequests(prev => prev.filter(req => req.walletAddress !== walletAddress))
      
      toast.success("Username change rejected")
    } catch (error) {
      console.error("Error rejecting username change:", error)
      toast.error("Failed to reject username change")
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Username Change Requests
        </CardTitle>
        <CardDescription>
          Review and approve username change requests from users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No pending username change requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.walletAddress} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {request.walletAddress.substring(0, 6)}...{request.walletAddress.substring(request.walletAddress.length - 4)}
                    </Badge>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Current Display:</span> {request.currentName}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Requested Change:</span> {request.requestedName || "New display option"}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(request.walletAddress)}
                    className="flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(request.walletAddress)}
                    className="flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
